import { createServer, type Server } from 'node:http';
import type { Avaliacao } from './match.js';
import type { Projeto } from './perfil.js';

export type Pesquisa = { rodando: boolean; etapa: string; terminadaEm: string | null };

export type AppState = {
  geradoEm: string;
  totalProjetos: number;
  avaliacoes: Avaliacao[];
  projetos?: Projeto[];
  pesquisa?: Pesquisa;
};

export type Acao = (etapa: (msg: string) => void) => Promise<void>;
export type Acoes = { pesquisar?: Acao; sincronizar?: Acao };

const PAGINA = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>EDITAL MATCH · soberano</title>
<style>
  :root { --bg:#0f1720; --surface:#16212e; --line:#24344a; --text:#e6edf5; --muted:#9db1c7;
          --alta:#2fbf71; --media:#efb034; --revisar:#9db1c7; --urgente:#e5484d; }
  [data-theme="light"] { --bg:#f4f6f9; --surface:#ffffff; --line:#d7dfe9; --text:#16212e; --muted:#5a6b80; }
  * { box-sizing:border-box; margin:0; }
  body { background:var(--bg); color:var(--text); font-family:system-ui,Segoe UI,sans-serif; padding:24px; transition:background .2s; }
  .wrap { max-width:920px; margin:0 auto; }
  .skip { position:absolute; left:-9999px; } .skip:focus { position:static; }
  header { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
  h1 { font-size:22px; display:flex; align-items:center; gap:10px; }
  .selo { font-size:11px; letter-spacing:1px; background:var(--alta); color:#04160c; padding:3px 8px; border-radius:99px; }
  .acoes { margin-left:auto; display:flex; gap:8px; }
  .acoes button { background:var(--surface); border:1px solid var(--line); color:var(--text); padding:6px 12px; border-radius:8px; cursor:pointer; font-size:13px; }
  .sub { color:var(--muted); font-size:13px; margin:6px 0 16px; }
  .busca { width:100%; background:var(--surface); border:1px solid var(--line); color:var(--text); padding:10px 14px; border-radius:10px; font-size:14px; margin-bottom:14px; }
  .metros { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:10px; margin-bottom:14px; }
  .metro { background:var(--surface); border:1px solid var(--line); border-radius:12px; padding:12px 14px; }
  .metro b { font-size:22px; display:block; }
  .metro span { font-size:12px; color:var(--muted); }
  .filtros { display:flex; gap:8px; margin-bottom:14px; flex-wrap:wrap; }
  .filtros button { background:var(--surface); border:1px solid var(--line); color:var(--muted); padding:6px 14px; border-radius:99px; cursor:pointer; font-size:13px; }
  .filtros button[aria-pressed="true"] { color:var(--text); border-color:var(--alta); }
  .card { background:var(--surface); border:1px solid var(--line); border-left-width:4px; border-radius:12px; padding:16px; margin-bottom:14px; }
  .card.u-alta { border-left-color:var(--urgente); }
  .card.u-media { border-left-color:var(--media); }
  .card h2 { font-size:16px; margin:8px 0 6px; }
  .card h2 a { color:var(--text); }
  .badge { font-size:11px; letter-spacing:1px; padding:3px 9px; border-radius:99px; font-weight:600; }
  .b-alta { background:var(--alta); color:#04160c; }
  .b-media { background:var(--media); color:#2b1d02; }
  .b-revisar { background:var(--line); color:var(--muted); }
  .proj { color:var(--muted); font-size:13px; margin-left:8px; }
  .why { font-size:14px; margin:4px 0; }
  .prazo { font-size:13px; color:var(--media); margin:4px 0; }
  .prazo.urgente { color:var(--urgente); font-weight:600; }
  .motivos { font-size:13px; color:var(--muted); margin:4px 0; }
  .det { background:none; border:none; color:var(--alta); cursor:pointer; font-size:13px; padding:4px 0; }
  ol { margin:8px 0 0 20px; font-size:13.5px; color:var(--muted); line-height:1.8; }
  .vazio { color:var(--muted); }
  .skel { height:110px; border-radius:12px; background:var(--surface); margin-bottom:14px; animation:pulsa 1.2s infinite; }
  @keyframes pulsa { 50% { opacity:.5 } }
  #toast { position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:var(--alta); color:#04160c; padding:10px 18px; border-radius:99px; font-size:14px; font-weight:600; opacity:0; pointer-events:none; transition:opacity .25s; }
  #modal { position:fixed; inset:0; background:rgba(4,10,16,.72); display:none; align-items:center; justify-content:center; padding:20px; }
  #modal.aberto { display:flex; }
  .mcard { background:var(--surface); border:1px solid var(--line); border-radius:14px; max-width:640px; width:100%; max-height:85vh; overflow-y:auto; padding:22px; }
  .mcard h2 { font-size:18px; margin:6px 0 10px; }
  .mcard h2 a { color:var(--text); }
  .barra { background:var(--line); border-radius:99px; height:8px; margin:4px 0 10px; }
  .barra i { display:block; height:8px; border-radius:99px; background:var(--alta); }
  .blab { font-size:12.5px; color:var(--muted); display:flex; justify-content:space-between; }
  button:focus-visible, a:focus-visible, input:focus-visible { outline:2px solid var(--alta); outline-offset:2px; }
</style>
</head>
<body>
<a class="skip" href="#lista">pular para os resultados</a>
<div class="wrap">
  <header>
    <h1>🎯 EDITAL MATCH <span class="selo">SOBERANO</span></h1>
    <div class="acoes">
      <button data-acao="csv" aria-label="Exportar avaliações em CSV">⬇ CSV</button>
      <button data-acao="tema" aria-label="Alternar tema claro e escuro">🌗 tema</button>
    </div>
  </header>
  <p class="sub" id="sub">carregando…</p>
  <input class="busca" id="busca" type="search" placeholder="buscar edital ou projeto… (atalho: /)" aria-label="Buscar edital ou projeto">
  <div class="metros" id="metros" aria-live="polite"></div>
  <div class="filtros" id="filtros" role="group" aria-label="Filtrar por chance"></div>
  <div id="lista"><div class="skel"></div><div class="skel"></div><div class="skel"></div></div>
</div>
<div id="toast" role="status"></div>
<div id="modal" role="dialog" aria-modal="true" aria-label="Detalhes do edital"><div class="mcard" id="mcard"></div></div>
<script>
var FILTRO = 'todas';
var DADOS = null;
var ULTIMO = '';
function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function dias(prazo) {
  if (!prazo) return null;
  var ms = new Date(prazo + 'T23:59:59') - new Date();
  return Math.ceil(ms / 86400000);
}
function rank(b) { return b === 'alta' ? 0 : (b === 'media' ? 1 : 2); }
function toast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.style.opacity = '1';
  setTimeout(function () { t.style.opacity = '0'; }, 2200);
}
function ordenadas() {
  return DADOS.avaliacoes.slice().sort(function (a, b) { return rank(a.badge) - rank(b.badge) || b.total - a.total; });
}
function filtradas() {
  var q = document.getElementById('busca').value.trim().toLowerCase();
  return ordenadas().filter(function (a) {
    if (FILTRO !== 'todas' && a.badge !== FILTRO) return false;
    if (q && (a.edital.titulo + ' ' + a.projeto).toLowerCase().indexOf(q) === -1) return false;
    return true;
  });
}
function urgencia(a) {
  var d = dias(a.edital.prazo);
  if (d !== null && d >= 0 && d <= 7) return 'u-alta';
  if (d !== null && d >= 0 && d <= 30) return 'u-media';
  return '';
}
function render() {
  if (!DADOS) return;
  var todas = ordenadas();
  var contas = { todas: todas.length, alta: 0, media: 0, revisar: 0 };
  todas.forEach(function (a) { contas[a.badge] += 1; });
  document.getElementById('sub').innerHTML = 'avaliado em ' + esc(DADOS.geradoEm)
    + ' · portfólio: ' + DADOS.totalProjetos + ' projetos · juiz: 100% local';
  document.getElementById('metros').innerHTML =
    '<div class="metro"><b style="color:var(--alta)">' + contas.alta + '</b><span>alta chance</span></div>'
    + '<div class="metro"><b style="color:var(--media)">' + contas.media + '</b><span>média chance</span></div>'
    + '<div class="metro"><b>' + contas.revisar + '</b><span>revisar elegibilidade</span></div>'
    + '<div class="metro"><b>' + todas.length + '</b><span>editais no banco</span></div>';
  var mostra = filtradas();
  var fs = ['todas', 'alta', 'media', 'revisar'];
  document.getElementById('filtros').innerHTML = fs.map(function (f) {
    return '<button data-filtro="' + f + '" aria-pressed="' + (FILTRO === f) + '">' + f + ' (' + contas[f] + ')</button>';
  }).join('');
  if (!mostra.length) {
    document.getElementById('lista').innerHTML = '<p class="vazio">nenhum edital neste filtro/busca. Banco vazio? rode: node dist/cli.js coleta &amp;&amp; node dist/cli.js match</p>';
    return;
  }
  document.getElementById('lista').innerHTML = mostra.map(function (a) {
    var idx = DADOS.avaliacoes.indexOf(a);
    var d = dias(a.edital.prazo);
    var prazoTxt = a.edital.prazo
      ? (d >= 0 ? a.edital.prazo + ' (' + d + ' dia' + (d === 1 ? '' : 's') + ')' : a.edital.prazo + ' (encerrado)')
      : 'verificar na página';
    var urgente = d !== null && d >= 0 && d <= 7;
    return '<div class="card ' + urgencia(a) + '">'
      + '<span class="badge b-' + a.badge + '">' + a.badge.toUpperCase() + (a.total ? ' · ' + a.total : '') + '</span>'
      + (a.projeto ? '<span class="proj">projeto: ' + esc(a.projeto) + '</span>' : '')
      + '<h2><a href="' + esc(a.edital.url) + '" target="_blank" rel="noopener noreferrer">' + esc(a.edital.titulo) + '</a></h2>'
      + '<p class="why">' + esc(a.porQue) + '</p>'
      + '<p class="prazo' + (urgente ? ' urgente' : '') + '">prazo: ' + esc(prazoTxt) + '</p>'
      + (a.elegibilidade.motivos.length ? '<p class="motivos">⛔ ' + a.elegibilidade.motivos.map(esc).join(' · ') + '</p>' : '')
      + '<button class="det" data-detalhe="' + idx + '" aria-label="Abrir detalhes de ' + esc(a.edital.titulo) + '">ver detalhes e passos →</button>'
      + '</div>';
  }).join('');
}
function abreModal(idx) {
  var a = DADOS.avaliacoes[idx];
  if (!a) return;
  var pesos = { alinhamento: 25, impacto: 20, competitividade: 20, viabilidade: 15, historico: 10, diversidade: 10 };
  var barras = Object.keys(pesos).map(function (k) {
    var v = a.score[k] || 0;
    var pct = Math.round(100 * v / pesos[k]);
    return '<div class="blab"><span>' + k + '</span><span>' + v + '/' + pesos[k] + '</span></div>'
      + '<div class="barra"><i style="width:' + pct + '%"></i></div>';
  }).join('');
  document.getElementById('mcard').innerHTML =
    '<span class="badge b-' + a.badge + '">' + a.badge.toUpperCase() + (a.total ? ' · ' + a.total + '/100' : '') + '</span>'
    + '<h2><a href="' + esc(a.edital.url) + '" target="_blank" rel="noopener noreferrer">' + esc(a.edital.titulo) + '</a></h2>'
    + '<p class="why">' + esc(a.porQue) + '</p>'
    + (a.projeto ? '<p class="motivos">projeto indicado: <b>' + esc(a.projeto) + '</b></p>' : '')
    + (a.elegibilidade.motivos.length ? '<p class="motivos">⛔ ' + a.elegibilidade.motivos.map(esc).join(' · ') + '</p>' : '')
    + (a.total ? '<h3 style="font-size:14px;margin:14px 0 8px">decomposição do score</h3>' + barras : '')
    + (a.passos.length ? '<h3 style="font-size:14px;margin:14px 0 4px">próximos passos</h3><ol>' + a.passos.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ol>' : '')
    + '<p style="margin-top:14px"><button data-fechar="1" style="background:var(--line);border:none;color:var(--text);padding:8px 16px;border-radius:8px;cursor:pointer">fechar (Esc)</button></p>';
  document.getElementById('modal').classList.add('aberto');
}
function fechaModal() { document.getElementById('modal').classList.remove('aberto'); }
function exportaCsv() {
  if (!DADOS) return;
  var linhas = [['titulo', 'url', 'badge', 'score', 'projeto', 'prazo', 'por_que'].join(';')];
  ordenadas().forEach(function (a) {
    linhas.push(['"' + a.edital.titulo.replace(/"/g, '""') + '"', a.edital.url, a.badge, a.total, '"' + a.projeto + '"', a.edital.prazo || '', '"' + a.porQue.replace(/"/g, '""') + '"'].join(';'));
  });
  var blob = new Blob(['\\ufeff' + linhas.join('\\n')], { type: 'text/csv;charset=utf-8' });
  var link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'edital-match.csv';
  link.click();
  toast('CSV exportado');
}
document.addEventListener('click', function (ev) {
  var el = ev.target.closest('[data-filtro],[data-detalhe],[data-acao],[data-fechar]');
  if (!el) { if (ev.target.id === 'modal') fechaModal(); return; }
  if (el.dataset.filtro) { FILTRO = el.dataset.filtro; render(); }
  else if (el.dataset.detalhe !== undefined) abreModal(Number(el.dataset.detalhe));
  else if (el.dataset.acao === 'csv') exportaCsv();
  else if (el.dataset.acao === 'tema') {
    var novo = document.documentElement.dataset.theme === 'light' ? '' : 'light';
    if (novo) document.documentElement.dataset.theme = novo; else delete document.documentElement.dataset.theme;
    try { localStorage.setItem('em-tema', novo); } catch (e) {}
  }
  else if (el.dataset.fechar) fechaModal();
});
document.addEventListener('keydown', function (ev) {
  if (ev.key === 'Escape') fechaModal();
  if (ev.key === '/' && document.activeElement !== document.getElementById('busca')) {
    ev.preventDefault();
    document.getElementById('busca').focus();
  }
});
document.getElementById('busca').addEventListener('input', function () { render(); });
try { if (localStorage.getItem('em-tema') === 'light') document.documentElement.dataset.theme = 'light'; } catch (e) {}
function tick() {
  fetch('/api/status').then(function (r) { return r.json(); }).then(function (s) {
    var agora = JSON.stringify(s);
    if (agora === ULTIMO) return;
    ULTIMO = agora;
    DADOS = s;
    render();
  }).catch(function () { toast('sem conexão com o motor'); });
}
tick();
setInterval(tick, 5000);
</script>
</body>
</html>`;

export function startServer(state: AppState, porta: number, acoes: Acoes = {}): Server {
  state.pesquisa = { rodando: false, etapa: '', terminadaEm: null };

  const dispara = (nome: keyof Acoes, res: import('node:http').ServerResponse): void => {
    const acao = acoes[nome];
    if (!acao) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ erro: `ação "${nome}" não disponível neste servidor` }));
      return;
    }
    if (state.pesquisa?.rodando) {
      res.writeHead(409, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ erro: 'já há uma ação em andamento', etapa: state.pesquisa.etapa }));
      return;
    }
    state.pesquisa = { rodando: true, etapa: 'iniciando', terminadaEm: null };
    acao((msg) => { if (state.pesquisa) state.pesquisa.etapa = msg; })
      .then(() => {
        state.pesquisa = { rodando: false, etapa: 'concluída', terminadaEm: new Date().toLocaleString('pt-BR') };
      })
      .catch((e) => {
        state.pesquisa = {
          rodando: false,
          etapa: `erro: ${e instanceof Error ? e.message : String(e)}`,
          terminadaEm: new Date().toLocaleString('pt-BR'),
        };
      });
    res.writeHead(202, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
  };

  const server = createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/api/pesquisar') { dispara('pesquisar', res); return; }
    if (req.method === 'POST' && req.url === '/api/sincronizar') { dispara('sincronizar', res); return; }
    if (req.url === '/api/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(state));
      return;
    }
    if (req.url === '/api/projetos') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(state.projetos ?? []));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(PAGINA);
  });
  server.listen(porta);
  return server;
}
