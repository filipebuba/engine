import { describe, it, expect } from 'vitest';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { carregar, salvar, anexar } from './store.js';

describe('store', () => {
  it('salva e recarrega JSON (criando diretórios)', () => {
    const dir = mkdtempSync(join(tmpdir(), 'em-store-'));
    const arq = join(dir, 'sub', 'dados.json');
    salvar(arq, { a: 1 });
    expect(carregar(arq, {})).toEqual({ a: 1 });
  });
  it('arquivo ausente devolve o padrão', () => {
    expect(carregar('/nao/existe.json', [1, 2])).toEqual([1, 2]);
  });
  it('anexar acumula eventos com timestamp (histórico só cresce)', () => {
    const dir = mkdtempSync(join(tmpdir(), 'em-trails-'));
    const arq = join(dir, 'trails.jsonl');
    anexar(arq, { tipo: 'julgamento', total: 74 });
    anexar(arq, { tipo: 'desfecho', status: 'aprovada' });
    const linhas = readFileSync(arq, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    expect(linhas).toHaveLength(2);
    expect(linhas[0].tipo).toBe('julgamento');
    expect(linhas[1].status).toBe('aprovada');
    expect(typeof linhas[0].ts).toBe('string');
  });
});
