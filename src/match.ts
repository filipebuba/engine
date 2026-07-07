import type { Edital } from './edital.js';
import { editalAberto } from './edital.js';
import type { PerfilBase } from './perfil.js';

export type Elegibilidade = { elegivel: boolean; motivos: string[] };

export function elegibilidadeDura(e: Edital, p: PerfilBase, hojeISO: string): Elegibilidade {
  const motivos: string[] = [];
  if (!editalAberto(e, hojeISO)) {
    motivos.push(`prazo encerrado (${e.prazo})`);
  }
  if (e.portes.length > 0 && !e.portes.includes(p.porte)) {
    motivos.push(`porte "${p.porte}" fora do público (${e.portes.join('/')})`);
  }
  if (e.locais.length > 0 && !e.locais.some((l) => p.locais.includes(l))) {
    motivos.push(`localização (${p.locais.join('/')}) fora do escopo (${e.locais.join('/')})`);
  }
  return { elegivel: motivos.length === 0, motivos };
}

export type ScoreSoft = {
  alinhamento: number;
  impacto: number;
  competitividade: number;
  viabilidade: number;
  historico: number;
  diversidade: number;
};

export const PESOS: Record<keyof ScoreSoft, number> = {
  alinhamento: 25,
  impacto: 20,
  competitividade: 20,
  viabilidade: 15,
  historico: 10,
  diversidade: 10,
};

export const SCORE_ZERO: ScoreSoft = {
  alinhamento: 0, impacto: 0, competitividade: 0, viabilidade: 0, historico: 0, diversidade: 0,
};

export function clampScore(s: ScoreSoft): ScoreSoft {
  const c = (v: number, max: number): number => Math.max(0, Math.min(max, Math.round(v)));
  return {
    alinhamento: c(s.alinhamento, PESOS.alinhamento),
    impacto: c(s.impacto, PESOS.impacto),
    competitividade: c(s.competitividade, PESOS.competitividade),
    viabilidade: c(s.viabilidade, PESOS.viabilidade),
    historico: c(s.historico, PESOS.historico),
    diversidade: c(s.diversidade, PESOS.diversidade),
  };
}

export function scoreTotal(s: ScoreSoft): number {
  const c = clampScore(s);
  return c.alinhamento + c.impacto + c.competitividade + c.viabilidade + c.historico + c.diversidade;
}

export type Badge = 'alta' | 'media' | 'revisar';

export function badge(total: number, eleg: Elegibilidade): Badge {
  if (!eleg.elegivel) return 'revisar';
  if (total >= 70) return 'alta';
  if (total >= 45) return 'media';
  return 'revisar';
}

export type Parecer = {
  projeto: string;
  score: ScoreSoft;
  porQue: string;
  passos: string[];
};

export type Juiz = (e: Edital, portfolio: string) => Promise<Parecer>;

export type Avaliacao = {
  edital: Edital;
  elegibilidade: Elegibilidade;
  projeto: string;
  score: ScoreSoft;
  total: number;
  badge: Badge;
  porQue: string;
  passos: string[];
};

export async function avaliar(
  e: Edital,
  p: PerfilBase,
  portfolio: string,
  juiz: Juiz,
  hojeISO: string,
): Promise<Avaliacao> {
  const eleg = elegibilidadeDura(e, p, hojeISO);
  if (!eleg.elegivel) {
    return {
      edital: e, elegibilidade: eleg, projeto: '', score: SCORE_ZERO, total: 0,
      badge: 'revisar', porQue: eleg.motivos.join('; '), passos: [],
    };
  }
  const par = await juiz(e, portfolio);
  const score = clampScore(par.score);
  const total = scoreTotal(score);
  return {
    edital: e, elegibilidade: eleg, projeto: par.projeto, score, total,
    badge: badge(total, eleg), porQue: par.porQue, passos: par.passos,
  };
}
