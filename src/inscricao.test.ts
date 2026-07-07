import { describe, it, expect } from 'vitest';
import { extrairLinkInscricao } from './inscricao.js';

const BASE = 'https://orgao.gov.br/noticias/edital-x';

describe('extrairLinkInscricao', () => {
  it('acha a âncora cujo texto fala em inscrição e resolve URL relativa', () => {
    const html = `
      <a href="/sobre">Sobre nós</a>
      <a href="/sistema/form?id=9"><strong>Faça sua inscrição aqui</strong></a>
      <a href="https://outro.com">outra coisa</a>`;
    expect(extrairLinkInscricao(html, BASE)).toBe('https://orgao.gov.br/sistema/form?id=9');
  });
  it('cai para o href com palavra-chave quando o texto não ajuda', () => {
    const html = `<a href="https://sistema.gov.br/candidaturas/abrir">clique aqui</a>`;
    expect(extrairLinkInscricao(html, BASE)).toBe('https://sistema.gov.br/candidaturas/abrir');
  });
  it('ignora mailto/âncora e devolve null sem candidato', () => {
    const html = `<a href="mailto:x@y.z">Inscrição por email</a><a href="#topo">Inscrições</a><a href="/home">Início</a>`;
    expect(extrairLinkInscricao(html, BASE)).toBeNull();
  });
  it('html sem links devolve null', () => {
    expect(extrairLinkInscricao('<p>sem âncoras</p>', BASE)).toBeNull();
  });
});
