// Descobre o link do FORMULÁRIO de inscrição na página do edital.
// Padrão do runner: script determinístico extrai âncoras; palavras-chave decidem.
const CHAVES = /inscri|candidat|submiss|cadastr|formul[aá]rio|participar|aplicar|apply/i;
const IGNORA = /^(mailto:|tel:|javascript:|#)/i;
// compartilhamento social e afins NUNCA são formulário de inscrição (falso-positivo clássico:
// o botão "tuitar" carrega o título do edital com a palavra "inscrições" no texto)
const BLOQUEIA = /twitter\.com|x\.com\/intent|facebook\.com|api\.whatsapp|wa\.me|web\.whatsapp|linkedin\.com\/(share|sharing)|t\.me\/|pinterest\.|instagram\.com|\/share|\/sharer|intent\/tweet|feed=|\.(jpg|jpeg|png|gif|css|js)(\?|$)|\/\d{2}\/\d{2}\/\d{4}\/|\/20\d{2}\/\d{1,2}\/(?!.*(inscri|candidat|form))/i;

export function linkSuspeito(url: string): boolean {
  return BLOQUEIA.test(url);
}

export function extrairLinkInscricao(html: string, urlBase: string): string | null {
  const ancoras = [...html.matchAll(/<a\b[^>]*href=["']([^"'#][^"']*)["'][^>]*>([\s\S]{0,200}?)<\/a>/gi)];
  const candidatos: { href: string; texto: string }[] = [];
  for (const m of ancoras) {
    const href = m[1].trim();
    if (IGNORA.test(href) || BLOQUEIA.test(href)) continue;
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

export async function baixarPagina(url: string): Promise<string | null> {
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 15000);
    const res = await fetch(url, { signal: ctl.signal, headers: { 'User-Agent': 'Mozilla/5.0 ai-skills-soberano/1.0' } });
    clearTimeout(t);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export async function buscarLinkInscricao(url: string): Promise<string | null> {
  const html = await baixarPagina(url);
  return html ? extrairLinkInscricao(html, url) : null;
}
