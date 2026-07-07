import { describe, it, expect } from 'vitest';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { carregar, salvar } from './store.js';

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
});
