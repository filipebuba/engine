import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

export type Projeto = {
  nome: string;
  oQueE: string;
  problema: string;
  stack: string;
  estado: string;
  palavrasChave: string[];
};

export type PerfilBase = {
  porte: string;
  locais: string[];
};

function campo(md: string, rotulo: RegExp): string {
  const m = md.match(rotulo);
  return m && m[1] ? m[1].trim() : '';
}

export function parseCartao(nome: string, md: string): Projeto {
  return {
    nome,
    oQueE: campo(md, /\*\*O que é:\*\*\s*(.+)/),
    problema: campo(md, /\*\*Problema\/cliente:\*\*\s*(.+)/),
    stack: campo(md, /\*\*Stack:\*\*\s*(.+)/),
    estado: campo(md, /\*\*Estado:\*\*\s*(.+)/),
    palavrasChave: campo(md, /\*\*Palavras-chave \(fomento\):\*\*\s*(.+)/)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

export function carregarProjetos(dir: string): Projeto[] {
  if (!existsSync(dir)) return [];
  const out: Projeto[] = [];
  for (const nome of readdirSync(dir)) {
    const pasta = join(dir, nome);
    try {
      if (!statSync(pasta).isDirectory()) continue;
    } catch {
      continue;
    }
    const cartao = join(pasta, 'PROJETO.md');
    if (!existsSync(cartao)) continue;
    try {
      out.push(parseCartao(nome, readFileSync(cartao, 'utf8')));
    } catch {
      continue;
    }
  }
  return out;
}

export function resumoPortfolio(projetos: Projeto[]): string {
  return projetos
    .map((p) => `- ${p.nome} — ${p.oQueE}${p.palavrasChave.length ? ` [${p.palavrasChave.join(', ')}]` : ''}`)
    .join('\n');
}
