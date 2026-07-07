import { describe, it, expect } from 'vitest';
import { paraTexto, normalizarExtracao, aplicarExtracao } from './extrator.js';
import { parseEdital } from './edital.js';

describe('paraTexto', () => {
  it('remove script/style/tags e comprime espaços', () => {
    const html = '<style>a{}</style><script>x()</script><p>Edital&nbsp;de   <b>fomento</b></p>';
    expect(paraTexto(html)).toBe('Edital de fomento');
  });
});

describe('normalizarExtracao', () => {
  it('valida tipos e formatos (prazo ISO, valor > 0, tipo do vocabulário)', () => {
    const x = normalizarExtracao({
      resumo: ' apoia IA ', valor_max_reais: 500000, tipo_recurso: 'subvencao',
      portes: ['ME', ''], setores: ['ia'], locais: ['BR'], estagios: ['tracao'],
      prazo: '2026-09-30', orgao: 'Finep',
    });
    expect(x.resumo).toBe('apoia IA');
    expect(x.valorMax).toBe(500000);
    expect(x.portes).toEqual(['ME']);
    expect(x.prazo).toBe('2026-09-30');
  });
  it('rejeita prazo não-ISO, valor negativo e tipo desconhecido', () => {
    const x = normalizarExtracao({ prazo: '30/09/2026', valor_max_reais: -5, tipo_recurso: 'doacao' });
    expect(x.prazo).toBeNull();
    expect(x.valorMax).toBeNull();
    expect(x.tipoRecurso).toBeNull();
  });
});

describe('aplicarExtracao', () => {
  const base = parseEdital({ id: 'x', titulo: 't', fonte: 'radar-editais', url: 'u', resumo: 'curto', prazo: '2026-08-01' });
  const extra = normalizarExtracao({
    resumo: 'resumo bem mais completo do edital', valor_max_reais: 100000, tipo_recurso: 'subvencao',
    portes: ['ME'], setores: ['ia'], locais: ['BR'], estagios: ['tracao'], prazo: '2026-12-31', orgao: 'Finep',
  });
  it('preenche lacunas e troca fonte genérica pelo órgão real', () => {
    const e = aplicarExtracao(base, extra);
    expect(e.valorMax).toBe(100000);
    expect(e.portes).toEqual(['ME']);
    expect(e.fonte).toBe('Finep');
    expect(e.resumo).toContain('completo');
    expect(e.extraidoEm).not.toBeNull();
  });
  it('NUNCA sobrescreve dado existente com o da extração (prazo já conhecido fica)', () => {
    const e = aplicarExtracao(base, extra);
    expect(e.prazo).toBe('2026-08-01');
  });
  it('extração vazia não apaga nada', () => {
    const cheio = { ...base, valorMax: 5, portes: ['EPP'] };
    const e = aplicarExtracao(cheio, normalizarExtracao({}));
    expect(e.valorMax).toBe(5);
    expect(e.portes).toEqual(['EPP']);
    expect(e.resumo).toBe('curto');
  });
});
