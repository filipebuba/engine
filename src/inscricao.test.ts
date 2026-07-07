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
  it('botão de compartilhar NUNCA vira formulário (o texto do tweet fala em inscrições)', () => {
    const html = `
      <a href="https://twitter.com/intent/tweet?text=Edital%20PRORROGA%20inscri%C3%A7%C3%B5es">Tweet</a>
      <a href="https://www.facebook.com/sharer/sharer.php?u=x">Compartilhar inscrições</a>`;
    expect(extrairLinkInscricao(html, BASE)).toBeNull();
  });
  it('com social bloqueado, acha o formulário legítimo seguinte', () => {
    const html = `
      <a href="https://twitter.com/intent/tweet?text=inscri%C3%A7%C3%B5es">Tweet</a>
      <a href="/inscricao/form">Inscreva-se</a>`;
    expect(extrairLinkInscricao(html, BASE)).toBe('https://orgao.gov.br/inscricao/form');
  });
});
