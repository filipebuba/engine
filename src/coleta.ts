import { parseEdital, type Edital } from './edital.js';

// Importa os matches do radar-editais (editais.jsonl) como fonte inicial do banco.
export function deRadar(jsonl: string): Edital[] {
  const out: Edital[] = [];
  for (const linha of jsonl.split('\n')) {
    const t = linha.trim();
    if (!t) continue;
    let r: Record<string, unknown>;
    try {
      r = JSON.parse(t) as Record<string, unknown>;
    } catch {
      continue;
    }
    const url = typeof r.url === 'string' ? r.url : '';
    if (!url) continue;
    const id = 'radar-' + url.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
    const prazo = typeof r.prazo === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(r.prazo) ? r.prazo : undefined;
    try {
      out.push(parseEdital({
        id,
        titulo: r.titulo,
        fonte: 'radar-editais',
        url,
        resumo: typeof r.por_que === 'string' ? r.por_que : '',
        ...(prazo ? { prazo } : {}),
      }));
    } catch {
      continue;
    }
  }
  const vistos = new Set<string>();
  return out.filter((e) => (vistos.has(e.id) ? false : (vistos.add(e.id), true)));
}
