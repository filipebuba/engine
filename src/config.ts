import { existsSync } from 'node:fs';

// Resolução de caminhos do dogfood (Windows ⇄ WSL) com override por variável de ambiente.
function primeiroExistente(candidatos: (string | undefined)[]): string | null {
  for (const c of candidatos) {
    if (c && existsSync(c)) return c;
  }
  return null;
}

export function caminhoRadar(): string | null {
  return primeiroExistente([
    process.env.EM_RADAR,
    '/home/buba/ai-skills/.agent/skills/radar-editais/editais.jsonl',
    '\\\\wsl.localhost\\Ubuntu\\home\\buba\\ai-skills\\.agent\\skills\\radar-editais\\editais.jsonl',
  ]);
}

export function caminhoProjetos(): string | null {
  return primeiroExistente([
    process.env.EM_PROJETOS,
    '/mnt/c/Users/fbg67/Documents/GitHub',
    'C:\\Users\\fbg67\\Documents\\GitHub',
  ]);
}
