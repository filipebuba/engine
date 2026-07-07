import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { execFile } from 'node:child_process';
import { deRadar } from './coleta.js';
import { carregarProjetos, resumoPortfolio, type PerfilBase, type Projeto } from './perfil.js';
import { avaliar, type Avaliacao } from './match.js';
import { juizLocal, redatorLocal } from './juiz.js';
import { carregar, salvar } from './store.js';
import { caminhoRadar, caminhoProjetos } from './config.js';
import { startServer, type AppState } from './server.js';
import type { Edital } from './edital.js';

const USO = `uso: edital-match <comando>
  perfil        fotografa os cartões PROJETO.md → data/portfolio.json + PORTFOLIO.md
  coleta        importa editais do radar-editais → data/editais.json
  match         avalia editais × portfólio (fotografia) com o juiz LOCAL → data/avaliacoes.json
  serve [porta] painel/API (padrão 4200) — com POST /api/pesquisar e /api/sincronizar`;

const ARQ_EDITAIS = 'data/editais.json';
const ARQ_AVALIACOES = 'data/avaliacoes.json';
const ARQ_PORTFOLIO = 'data/portfolio.json';

// Perfil do dogfood: pesquisador-desenvolvedor independente, BR + GW.
const PERFIL: PerfilBase = { porte: 'pessoa_fisica', locais: ['BR', 'GW'] };

// A "fotografia" do portfólio: lê a pasta real UMA vez e grava o skill do juiz.
function fotografarPortfolio(): Projeto[] {
  const dir = caminhoProjetos();
  if (!dir) throw new Error('pasta de projetos não encontrada (defina EM_PROJETOS)');
  const projetos = carregarProjetos(dir);
  if (projetos.length === 0) throw new Error(`nenhum PROJETO.md em ${dir} — rode o semear_cartoes.sh`);
  salvar(ARQ_PORTFOLIO, projetos);
  writeFileSync('PORTFOLIO.md', [
    '# PORTFÓLIO — descrição dos produtos (o "skill" do juiz)',
    '',
    `> Fotografia dos cartões PROJETO.md (${projetos.length} produtos) em ${new Date().toLocaleString('pt-BR')}.`,
    '> O juiz local usa ESTA fotografia — não varre mais a pasta a cada match.',
    '> Nasceu produto novo ou cartão mudou? Regenerar: node dist/cli.js perfil (ou botão "sincronizar" no app).',
    '',
    resumoPortfolio(projetos),
    '',
  ].join('\n'));
  return projetos;
}

// Snapshot primeiro; varredura da pasta só como bootstrap se a fotografia não existe.
function obterPortfolio(): Projeto[] {
  const foto = carregar<Projeto[]>(ARQ_PORTFOLIO, []);
  if (foto.length > 0) return foto;
  return fotografarPortfolio();
}

function importarDoRadar(): { novos: number; total: number } {
  const radar = caminhoRadar();
  if (!radar) throw new Error('radar-editais não encontrado (defina EM_RADAR)');
  const novos = deRadar(readFileSync(radar, 'utf8'));
  const atuais = carregar<Edital[]>(ARQ_EDITAIS, []);
  const porId = new Map(atuais.map((e) => [e.id, e]));
  for (const e of novos) porId.set(e.id, e);
  const todos = [...porId.values()];
  salvar(ARQ_EDITAIS, todos);
  return { novos: novos.length, total: todos.length };
}

async function matchCore(log: (msg: string) => void): Promise<AppState> {
  const editais = carregar<Edital[]>(ARQ_EDITAIS, []);
  if (editais.length === 0) throw new Error('banco vazio — rode "coleta" (ou o botão pesquisar)');
  const projetos = obterPortfolio();
  const portfolio = resumoPortfolio(projetos);
  const juiz = juizLocal();
  const hoje = new Date().toISOString().slice(0, 10);
  const avaliacoes: Avaliacao[] = [];
  // sequencial de propósito: 1 modelo grande por vez na GPU
  for (const [i, e] of editais.entries()) {
    log(`julgando ${i + 1}/${editais.length}: ${e.titulo.slice(0, 50)}`);
    try {
      avaliacoes.push(await avaliar(e, PERFIL, portfolio, juiz, hoje));
    } catch (err) {
      log(`erro em "${e.titulo.slice(0, 30)}": ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  const state: AppState = {
    geradoEm: new Date().toLocaleString('pt-BR'),
    totalProjetos: projetos.length,
    avaliacoes,
  };
  salvar(ARQ_AVALIACOES, state);
  return state;
}

// Varredura do radar (skill do ai-skills) — melhor-esforço: só no WSL/linux e se existir.
function varrerRadar(): Promise<void> {
  return new Promise((resolve) => {
    const sh = process.env.EM_RADAR_SH
      ?? `${process.env.HOME ?? ''}/ai-skills/.agent/skills/radar-editais/radar.sh`;
    if (process.platform !== 'linux' || !existsSync(sh)) { resolve(); return; }
    execFile('bash', [sh], {
      env: { ...process.env, RADAR_MAX_NOVOS: process.env.RADAR_MAX_NOVOS ?? '8' },
      timeout: 15 * 60 * 1000,
    }, () => resolve());
  });
}

async function perfil(): Promise<number> {
  try {
    const ps = fotografarPortfolio();
    console.log(`✔ portfólio fotografado: ${ps.length} produtos (${ARQ_PORTFOLIO} + PORTFOLIO.md)`);
    return 0;
  } catch (e) {
    console.error(`perfil: ${e instanceof Error ? e.message : String(e)}`);
    return 1;
  }
}

async function coleta(): Promise<number> {
  try {
    const r = importarDoRadar();
    console.log(`✔ coleta: ${r.novos} do radar, ${r.total} no banco (${ARQ_EDITAIS})`);
    return 0;
  } catch (e) {
    console.error(`coleta: ${e instanceof Error ? e.message : String(e)}`);
    return 1;
  }
}

async function match(): Promise<number> {
  try {
    const st = await matchCore((m) => console.log(`  · ${m}`));
    const altas = st.avaliacoes.filter((a) => a.badge === 'alta').length;
    console.log(`✔ match: ${st.avaliacoes.length} avaliados, ${altas} de alta chance (${ARQ_AVALIACOES})`);
    return 0;
  } catch (e) {
    console.error(`match: ${e instanceof Error ? e.message : String(e)}`);
    return 1;
  }
}

function serve(portaArg: string | undefined): number {
  const porta = Number(portaArg) > 0 ? Number(portaArg) : 4200;
  const state = carregar<AppState>(ARQ_AVALIACOES, {
    geradoEm: '(sem avaliação — use o botão "pesquisar editais")', totalProjetos: 0, avaliacoes: [],
  });
  try { state.projetos = obterPortfolio(); } catch { state.projetos = []; }
  if (state.totalProjetos === 0) state.totalProjetos = state.projetos.length;

  startServer(state, porta, {
    pesquisar: async (etapa) => {
      etapa('varrendo a web (radar de editais)');
      await varrerRadar();
      etapa('importando editais do radar');
      try { importarDoRadar(); } catch { /* radar ausente: julga o banco atual */ }
      etapa('julgando com o modelo local');
      const novo = await matchCore(etapa);
      state.geradoEm = novo.geradoEm;
      state.avaliacoes = novo.avaliacoes;
      state.totalProjetos = novo.totalProjetos;
    },
    sincronizar: async (etapa) => {
      etapa('refotografando os cartões PROJETO.md');
      const ps = fotografarPortfolio();
      state.projetos = ps;
      state.totalProjetos = ps.length;
    },
    proposta: async (editalId, etapa) => {
      const aval = state.avaliacoes.find((a) => a.edital.id === editalId);
      if (!aval) throw new Error(`edital não avaliado: ${editalId}`);
      const proj = (state.projetos ?? []).find((p) => p.nome === aval.projeto);
      const resumo = proj
        ? `${proj.nome} — ${proj.oQueE}\nproblema/cliente: ${proj.problema}\nstack: ${proj.stack}\nestado: ${proj.estado}\npalavras-chave: ${proj.palavrasChave.join(', ')}`
        : (aval.projeto || '[COMPLETAR: projeto não identificado]');
      etapa(`redigindo rascunho para "${aval.edital.titulo.slice(0, 40)}…" com o modelo local`);
      return redatorLocal()(aval.edital, resumo, aval.porQue);
    },
  });
  console.log(`🌐 EDITAL MATCH no ar: http://localhost:${porta}`);
  return 0;
}

export async function cli(args: string[]): Promise<number> {
  switch (args[0]) {
    case 'perfil': return perfil();
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
