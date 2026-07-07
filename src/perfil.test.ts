import { describe, it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseCartao, carregarProjetos, resumoPortfolio } from './perfil.js';

const CARTAO = `# demo — cartão do projeto

**O que é:** App de teste que faz coisas.

**Problema/cliente:** PMEs sem tempo.

**Stack:** TypeScript, Node.

**Estado:** protótipo

**Palavras-chave (fomento):** automação, PME, SaaS
`;

describe('parseCartao', () => {
  it('extrai os campos do PROJETO.md', () => {
    const p = parseCartao('demo', CARTAO);
    expect(p.nome).toBe('demo');
    expect(p.oQueE).toBe('App de teste que faz coisas.');
    expect(p.estado).toBe('protótipo');
    expect(p.palavrasChave).toEqual(['automação', 'PME', 'SaaS']);
  });
  it('cartão sem campos vira strings vazias (não quebra)', () => {
    const p = parseCartao('vazio', '# nada aqui');
    expect(p.oQueE).toBe('');
    expect(p.palavrasChave).toEqual([]);
  });
});

describe('carregarProjetos', () => {
  it('lê os cartões da pasta real e ignora pastas sem cartão', () => {
    const dir = mkdtempSync(join(tmpdir(), 'em-perfil-'));
    mkdirSync(join(dir, 'com-cartao'));
    writeFileSync(join(dir, 'com-cartao', 'PROJETO.md'), CARTAO);
    mkdirSync(join(dir, 'sem-cartao'));
    writeFileSync(join(dir, 'arquivo-solto.txt'), 'x');
    const ps = carregarProjetos(dir);
    expect(ps).toHaveLength(1);
    expect(ps[0].nome).toBe('com-cartao');
  });
  it('pasta inexistente devolve lista vazia', () => {
    expect(carregarProjetos('/nao/existe/mesmo')).toEqual([]);
  });
});

describe('resumoPortfolio', () => {
  it('gera uma linha por projeto com palavras-chave', () => {
    const txt = resumoPortfolio([parseCartao('demo', CARTAO)]);
    expect(txt).toBe('- demo — App de teste que faz coisas. [automação, PME, SaaS]');
  });
});
