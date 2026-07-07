import { describe, it, expect } from 'vitest';
import { deRadar } from './coleta.js';

describe('deRadar', () => {
  it('converte registros do radar em Editais válidos', () => {
    const jsonl = [
      JSON.stringify({ ts: '2026-07-06T19:40:00-03:00', titulo: 'Edital IA', url: 'https://ex.com/a', busca: 'q', match: 'alto', projeto: 'SoberanIA', por_que: 'casa bem', proximos_passos: ['x'], prazo: 'verificar na página' }),
      JSON.stringify({ titulo: 'Edital B', url: 'https://ex.com/b', por_que: 'ok', prazo: '2026-09-30' }),
    ].join('\n');
    const es = deRadar(jsonl);
    expect(es).toHaveLength(2);
    expect(es[0].fonte).toBe('radar-editais');
    expect(es[0].prazo).toBeNull();
    expect(es[1].prazo).toBe('2026-09-30');
    expect(es[0].resumo).toBe('casa bem');
  });
  it('ignora linhas quebradas e sem url; deduplica por url', () => {
    const jsonl = [
      'não é json',
      JSON.stringify({ titulo: 'sem url' }),
      JSON.stringify({ titulo: 'A', url: 'https://ex.com/a' }),
      JSON.stringify({ titulo: 'A de novo', url: 'https://ex.com/a' }),
    ].join('\n');
    const es = deRadar(jsonl);
    expect(es).toHaveLength(1);
  });
  it('jsonl vazio devolve lista vazia', () => {
    expect(deRadar('')).toEqual([]);
  });
});
