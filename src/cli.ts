import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { deRadar } from './coleta.js';
import { carregarProjetos, resumoPortfolio, type PerfilBase } from './perfil.js';
import { avaliar, type Avaliacao } from './match.js';
import { juizLocal } from './juiz.js';
import { carregar, salvar } from './store.js';
import { caminhoRadar, caminhoProjetos } from './config.js';
import { startServer, type AppState } from './server.js';
import type { Edital } from './edital.js';

const USO = `uso: edital-match <comando>
  coleta        importa editais do radar-editais → data/editais.json
  match         avalia editais abertos × portfólio com o juiz LOCAL → data/avaliacoes.json
  serve [porta] painel web (padrão 4200)`;

const ARQ_EDITAIS = 'data/editais.json';
const ARQ_AVALIACOES = 'data/avaliacoes.json';

// Perfil do dogfood: pesquisador-desenvolvedor independente, BR + GW.
const PERFIL: PerfilBase = { porte: 'pessoa_fisica', locais: ['BR', 'GW'] };

async function coleta(): Promise<number> {
  const radar = caminhoRadar();
  if (!radar) {
    console.error('coleta: radar-editais não encontrado (defina EM_RADAR com o caminho do editais.jsonl)');
    return 1;
  }
  const novos = deRadar(readFileSync(radar, 'utf8'));
  const atuais = carregar<Edital[]>(ARQ_EDITAIS, []);
  const porId = new Map(atuais.map((e) => [e.id, e]));
  for (const e of novos) porId.set(e.id, e);
  const todos = [...porId.values()];
  salvar(ARQ_EDITAIS, todos);
  console.log(`✔ coleta: ${novos.length} do radar, ${todos.length} no banco (${ARQ_EDITAIS})`);
  return 0;
}

async function match(): Promise<number> {
  const editais = carregar<Edital[]>(ARQ_EDITAIS, []);
  if (editais.length === 0) {
    console.error('match: banco vazio — rode "coleta" primeiro');
    return 1;
  }
  const dirProjetos = caminhoProjetos();
  if (!dirProjetos) {
    console.error('match: pasta de projetos não encontrada (defina EM_PROJETOS)');
    return 1;
  }
  const projetos = carregarProjetos(dirProjetos);
  if (projetos.length === 0) {
    console.error(`match: nenhum PROJETO.md em ${dirProjetos} — rode o semear_cartoes.sh`);
    return 1;
  }
  const portfolio = resumoPortfolio(projetos);
  const juiz = juizLocal();
  const hoje = new Date().toISOString().slice(0, 10);
  const avaliacoes: Avaliacao[] = [];
  // sequencial de propósito: 1 modelo grande por vez na GPU
  for (const [i, e] of editais.entries()) {
    process.stdout.write(`  · avaliando ${i + 1}/${editais.length}: ${e.titulo.slice(0, 60)}… `);
    try {
      const a = await avaliar(e, PERFIL, portfolio, juiz, hoje);
      avaliacoes.push(a);
      console.log(a.elegibilidade.elegivel ? `${a.badge.toUpperCase()} ${a.total} → ${a.projeto}` : `revisar (${a.elegibilidade.motivos[0] ?? ''})`);
    } catch (err) {
      console.log(`erro: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  const state: AppState = {
    geradoEm: new Date().toLocaleString('pt-BR'),
    totalProjetos: projetos.length,
    avaliacoes,
  };
  salvar(ARQ_AVALIACOES, state);
  const altas = avaliacoes.filter((a) => a.badge === 'alta').length;
  console.log(`✔ match: ${avaliacoes.length} avaliados, ${altas} de alta chance (${ARQ_AVALIACOES})`);
  return 0;
}

function serve(portaArg: string | undefined): number {
  const porta = Number(portaArg) > 0 ? Number(portaArg) : 4200;
  const state = carregar<AppState>(ARQ_AVALIACOES, { geradoEm: '(sem avaliação — rode coleta e match)', totalProjetos: 0, avaliacoes: [] });
  startServer(state, porta);
  console.log(`🌐 EDITAL MATCH no ar: http://localhost:${porta}`);
  return 0;
}

export async function cli(args: string[]): Promise<number> {
  const cmd = args[0];
  switch (cmd) {
    case 'coleta': return coleta();
    case 'match': return match();
    case 'serve': return serve(args[1]);
    default:
      console.error(USO);
      return 1;
  }
}

const isMain = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  cli(process.argv.slice(2)).then((code) => { if (code !== 0) process.exitCode = code; });
}
