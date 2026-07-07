import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync } from 'node:fs';
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

// Trails: histórico que SÓ CRESCE (dataset do juiz-LoRA) — uma linha JSON por evento.
export function anexar(caminho: string, evento: Record<string, unknown>): void {
  mkdirSync(dirname(caminho), { recursive: true });
  appendFileSync(caminho, `${JSON.stringify({ ts: new Date().toISOString(), ...evento })}\n`);
}
