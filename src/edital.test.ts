import { describe, it, expect } from 'vitest';
import { parseEdital, editalAberto } from './edital.js';

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
    expect(e.linkInscricao).toBeNull();
    expect(e.extraidoEm).toBeNull();
  });
  it('aceita linkInscricao http e rejeita não-http', () => {
    const com = parseEdital({ id: 'x', titulo: 't', fonte: 'f', url: 'u', linkInscricao: 'https://form.gov.br/x' });
    expect(com.linkInscricao).toBe('https://form.gov.br/x');
    const sem = parseEdital({ id: 'x', titulo: 't', fonte: 'f', url: 'u', linkInscricao: 'javascript:x' });
    expect(sem.linkInscricao).toBeNull();
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
