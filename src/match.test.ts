import { describe, it, expect } from 'vitest';
import { parseEdital } from './edital.js';
import {
  elegibilidadeDura, clampScore, scoreTotal, badge, avaliar, PESOS, type Juiz,
} from './match.js';

const HOJE = '2026-07-06';
const PERFIL = { porte: 'pessoa_fisica', locais: ['BR', 'GW'] };
const aberto = parseEdital({ id: 'a', titulo: 'Chamada IA', fonte: 'f', url: 'u', prazo: '2026-12-31' });

describe('elegibilidadeDura', () => {
  it('edital aberto sem restrições é elegível', () => {
    expect(elegibilidadeDura(aberto, PERFIL, HOJE)).toEqual({ elegivel: true, motivos: [] });
  });
  it('prazo vencido elimina com motivo', () => {
    const vencido = { ...aberto, prazo: '2026-02-06' };
    const r = elegibilidadeDura(vencido, PERFIL, HOJE);
    expect(r.elegivel).toBe(false);
    expect(r.motivos[0]).toContain('prazo encerrado');
  });
  it('porte fora do público elimina com motivo', () => {
    const soME = { ...aberto, portes: ['ME', 'EPP'] };
    const r = elegibilidadeDura(soME, PERFIL, HOJE);
    expect(r.elegivel).toBe(false);
    expect(r.motivos[0]).toContain('porte');
  });
  it('local casa quando há interseção', () => {
    const br = { ...aberto, locais: ['BR'] };
    expect(elegibilidadeDura(br, PERFIL, HOJE).elegivel).toBe(true);
  });
  it('edital global/worldwide é elegível de qualquer lugar', () => {
    const mundial = { ...aberto, locais: ['global'] };
    expect(elegibilidadeDura(mundial, PERFIL, HOJE).elegivel).toBe(true);
    const eu = { ...aberto, locais: ['EU'] };
    expect(elegibilidadeDura(eu, PERFIL, HOJE).elegivel).toBe(false);
  });
  it('acumula múltiplos motivos', () => {
    const ruim = { ...aberto, prazo: '2026-01-01', portes: ['ME'], locais: ['PT'] };
    expect(elegibilidadeDura(ruim, PERFIL, HOJE).motivos).toHaveLength(3);
  });
});

describe('score e badge', () => {
  it('clampScore prende cada componente ao seu peso máximo', () => {
    const c = clampScore({ alinhamento: 99, impacto: -5, competitividade: 10.6, viabilidade: 15, historico: 10, diversidade: 10 });
    expect(c.alinhamento).toBe(PESOS.alinhamento);
    expect(c.impacto).toBe(0);
    expect(c.competitividade).toBe(11);
  });
  it('scoreTotal soma os componentes clampados (máximo 100)', () => {
    expect(scoreTotal({ alinhamento: 25, impacto: 20, competitividade: 20, viabilidade: 15, historico: 10, diversidade: 10 })).toBe(100);
  });
  it('badge: alta >= 70, media >= 45, senão revisar; inelegível sempre revisar', () => {
    const eleg = { elegivel: true, motivos: [] };
    expect(badge(82, eleg)).toBe('alta');
    expect(badge(50, eleg)).toBe('media');
    expect(badge(30, eleg)).toBe('revisar');
    expect(badge(95, { elegivel: false, motivos: ['prazo'] })).toBe('revisar');
  });
});

describe('avaliar', () => {
  const juizFake: Juiz = async () => ({
    projeto: 'SoberanIA',
    score: { alinhamento: 25, impacto: 18, competitividade: 15, viabilidade: 12, historico: 5, diversidade: 8 },
    porQue: 'casa direto',
    passos: ['ler o edital', 'preparar proposta'],
  });
  it('elegível: consulta o juiz e monta a avaliação completa', async () => {
    const a = await avaliar(aberto, PERFIL, '- SoberanIA — IA local', juizFake, HOJE);
    expect(a.projeto).toBe('SoberanIA');
    expect(a.total).toBe(83);
    expect(a.badge).toBe('alta');
    expect(a.passos).toHaveLength(2);
  });
  it('inelegível: NÃO chama o juiz (custo zero) e devolve revisar', async () => {
    let chamado = false;
    const espiao: Juiz = async () => { chamado = true; return juizFake(aberto, ''); };
    const vencido = { ...aberto, prazo: '2026-01-01' };
    const a = await avaliar(vencido, PERFIL, '', espiao, HOJE);
    expect(chamado).toBe(false);
    expect(a.badge).toBe('revisar');
    expect(a.total).toBe(0);
    expect(a.porQue).toContain('prazo encerrado');
  });
});
