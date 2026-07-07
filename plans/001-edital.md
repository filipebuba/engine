# Plano 001 — Núcleo: tipo Edital, validação e prazo (TDD)

Objetivo de produto: o EDITAL MATCH nasce pelo dado — um `Edital` validado e a regra
de "ainda está aberto?" (a lição do radar: prazo vencido não pode virar match).
IMPORTS especificados por tarefa — copie exatamente. Emita cada arquivo completo em
blocos === FILE: caminho === / === END ===.

- [x] Criar `src/edital.ts` e `src/edital.test.ts` conforme a "Spec tarefa 1" (tipo Edital, parseEdital com validação rigorosa e defaults, editalAberto comparando prazo ISO com hoje). (feito pelo CONDUTOR: 2 rodadas do loop abaixo do teto — decisão do dono: entrega primeiro)

## Spec tarefa 1 — src/edital.ts

edital.ts SEM imports.

Tipos obrigatórios (copie LITERALMENTE):

export type TipoRecurso = 'fundo_perdido' | 'subvencao' | 'emprestimo' | 'equity' | 'aceleracao';

export type Edital = {
  id: string;
  titulo: string;
  fonte: string;
  url: string;
  resumo: string;
  valorMax: number | null;
  tipoRecurso: TipoRecurso | null;
  portes: string[];
  setores: string[];
  locais: string[];
  estagios: string[];
  prazo: string | null;
};

export function parseEdital(raw: unknown): Edital — comportamento (na ordem):
1. se typeof raw !== 'object' || raw === null → lançar new Error('edital inválido: não é objeto')
2. const o = raw as Record<string, unknown>;
3. para cada campo obrigatório de ['id', 'titulo', 'fonte', 'url']: se typeof o[campo] !== 'string' || o[campo].trim() === '' → lançar new Error(`edital inválido: falta ${campo}`) (template literal com o nome do campo)
4. const resumo = typeof o.resumo === 'string' ? o.resumo : '';
5. const valorMax = typeof o.valorMax === 'number' && o.valorMax > 0 ? o.valorMax : null;
6. const TIPOS: TipoRecurso[] = ['fundo_perdido', 'subvencao', 'emprestimo', 'equity', 'aceleracao'];
   const tipoRecurso = TIPOS.includes(o.tipoRecurso as TipoRecurso) ? (o.tipoRecurso as TipoRecurso) : null;
7. função interna const lista = (v: unknown): string[] => Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
   aplicar em portes, setores, locais, estagios.
8. prazo: se typeof o.prazo === 'string' → se NÃO casar com /^\d{4}-\d{2}-\d{2}$/ lançar new Error('edital inválido: prazo deve ser AAAA-MM-DD'); se casar, usar o valor. Se o.prazo não for string → null.
9. devolver o objeto Edital com todos os campos acima (id, titulo, fonte e url como string, usando String(o.id) etc. NÃO é necessário — já validados como string no passo 3; use o.id as string).

export function editalAberto(e: Edital, hojeISO: string): boolean — comportamento:
1. se e.prazo === null → devolver true (prazo desconhecido: verificar na página, não descartar)
2. senão devolver e.prazo >= hojeISO (comparação de string funciona em ISO AAAA-MM-DD)

Imports do edital.test.ts (exatamente estas duas linhas):
import { describe, it, expect } from 'vitest';
import { parseEdital, editalAberto } from './edital.js';

Casos de teste (copie LITERALMENTE):

describe('parseEdital', () => {
  it('aceita edital completo e normaliza os campos', () => {
    const e = parseEdital({
      id: 'finep-2026-01', titulo: 'Chamada IA', fonte: 'Finep',
      url: 'https://finep.gov.br/x', resumo: 'apoio a IA',
      valorMax: 500000, tipoRecurso: 'subvencao',
      portes: ['ME', 'EPP'], setores: ['ia', 'software'],
      locais: ['BR'], estagios: ['tracao'], prazo: '2026-09-30',
    });
    expect(e.id).toBe('finep-2026-01');
    expect(e.valorMax).toBe(500000);
    expect(e.tipoRecurso).toBe('subvencao');
    expect(e.portes).toEqual(['ME', 'EPP']);
    expect(e.prazo).toBe('2026-09-30');
  });
  it('aplica defaults nos campos opcionais ausentes', () => {
    const e = parseEdital({ id: 'x', titulo: 't', fonte: 'f', url: 'https://u' });
    expect(e.resumo).toBe('');
    expect(e.valorMax).toBeNull();
    expect(e.tipoRecurso).toBeNull();
    expect(e.portes).toEqual([]);
    expect(e.prazo).toBeNull();
  });
  it('rejeita sem id', () => {
    expect(() => parseEdital({ titulo: 't', fonte: 'f', url: 'u' })).toThrow('edital inválido: falta id');
  });
  it('rejeita não-objeto', () => {
    expect(() => parseEdital('oi')).toThrow('edital inválido: não é objeto');
  });
  it('rejeita prazo mal formatado', () => {
    expect(() => parseEdital({ id: 'x', titulo: 't', fonte: 'f', url: 'u', prazo: '30/09/2026' })).toThrow('prazo deve ser AAAA-MM-DD');
  });
  it('tipoRecurso desconhecido vira null', () => {
    const e = parseEdital({ id: 'x', titulo: 't', fonte: 'f', url: 'u', tipoRecurso: 'doacao' });
    expect(e.tipoRecurso).toBeNull();
  });
});

describe('editalAberto', () => {
  const base = parseEdital({ id: 'x', titulo: 't', fonte: 'f', url: 'u' });
  it('sem prazo, fica aberto (verificar na página)', () => {
    expect(editalAberto(base, '2026-07-06')).toBe(true);
  });
  it('prazo no futuro, aberto', () => {
    expect(editalAberto({ ...base, prazo: '2026-12-31' }, '2026-07-06')).toBe(true);
  });
  it('prazo no passado, fechado', () => {
    expect(editalAberto({ ...base, prazo: '2026-02-06' }, '2026-07-06')).toBe(false);
  });
  it('prazo hoje, ainda aberto', () => {
    expect(editalAberto({ ...base, prazo: '2026-07-06' }, '2026-07-06')).toBe(true);
  });
});
