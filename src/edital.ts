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
  linkInscricao: string | null;
  extraidoEm: string | null;
};

const TIPOS: TipoRecurso[] = ['fundo_perdido', 'subvencao', 'emprestimo', 'equity', 'aceleracao'];

export function parseEdital(raw: unknown): Edital {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('edital inválido: não é objeto');
  }
  const o = raw as Record<string, unknown>;
  for (const campo of ['id', 'titulo', 'fonte', 'url'] as const) {
    const v = o[campo];
    if (typeof v !== 'string' || v.trim() === '') {
      throw new Error(`edital inválido: falta ${campo}`);
    }
  }
  const lista = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  let prazo: string | null = null;
  if (typeof o.prazo === 'string') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(o.prazo)) {
      throw new Error('edital inválido: prazo deve ser AAAA-MM-DD');
    }
    prazo = o.prazo;
  }
  return {
    id: o.id as string,
    titulo: o.titulo as string,
    fonte: o.fonte as string,
    url: o.url as string,
    resumo: typeof o.resumo === 'string' ? o.resumo : '',
    valorMax: typeof o.valorMax === 'number' && o.valorMax > 0 ? o.valorMax : null,
    tipoRecurso: TIPOS.includes(o.tipoRecurso as TipoRecurso) ? (o.tipoRecurso as TipoRecurso) : null,
    portes: lista(o.portes),
    setores: lista(o.setores),
    locais: lista(o.locais),
    estagios: lista(o.estagios),
    prazo,
    linkInscricao: typeof o.linkInscricao === 'string' && o.linkInscricao.startsWith('http') ? o.linkInscricao : null,
    extraidoEm: typeof o.extraidoEm === 'string' ? o.extraidoEm : null,
  };
}

export function editalAberto(e: Edital, hojeISO: string): boolean {
  if (e.prazo === null) return true;
  return e.prazo >= hojeISO;
}
