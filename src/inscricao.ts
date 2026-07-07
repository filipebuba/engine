// Descobre o link do FORMULÁRIO de inscrição na página do edital.
// Padrão do runner: script determinístico extrai âncoras; palavras-chave decidem.
const CHAVES = /inscri|candidat|submiss|cadastr|formul[aá]rio|participar|aplicar|apply/i;
const IGNORA = /^(mailto:|tel:|javascript:|#)/i;

export function extrairLinkInscricao(html: string, urlBase: string): string | null {
  const ancoras = [...html.matchAll(/<a\b[^>]*href=["']([^"'#][^"']*)["'][^>]*>([\s\S]{0,200}?)<\/a>/gi)];
  const candidatos: { href: string; texto: string }[] = [];
  for (const m of ancoras) {
    const href = m[1].trim();
    if (IGNORA.test(href)) continue;
    const texto = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    candidatos.push({ href, texto });
  }
  // 1º: âncora cujo TEXTO fala em inscrição; 2º: cujo href fala
  const alvo = candidatos.find((c) => CHAVES.test(c.texto)) ?? candidatos.find((c) => CHAVES.test(c.href));
  if (!alvo) return null;
  try {
    return new URL(alvo.href, urlBase).toString();
  } catch {
    return null;
  }
}

export async function buscarLinkInscricao(url: string): Promise<string | null> {
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 15000);
    const res = await fetch(url, { signal: ctl.signal, headers: { 'User-Agent': 'Mozilla/5.0 ai-skills-soberano/1.0' } });
    clearTimeout(t);
    if (!res.ok) return null;
    return extrairLinkInscricao(await res.text(), url);
  } catch {
    return null;
  }
}
