import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';

export function carregar<T>(caminho: string, padrao: T): T {
  if (!existsSync(caminho)) return padrao;
  try {
    return JSON.parse(readFileSync(caminho, 'utf8')) as T;
  } catch {
    return padrao;
  }
}

export function salvar(caminho: string, dados: unknown): void {
  mkdirSync(dirname(caminho), { recursive: true });
  writeFileSync(caminho, JSON.stringify(dados, null, 2));
}
