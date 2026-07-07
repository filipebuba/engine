import { createServer, type Server } from 'node:http';
import type { Avaliacao } from './match.js';

export type AppState = {
  geradoEm: string;
  totalProjetos: number;
  avaliacoes: Avaliacao[];
};

const PAGINA = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>EDITAL MATCH · soberano</title>
<style>
  :root { --bg:#0f1720; --surface:#16212e; --line:#24344a; --text:#e6edf5; --muted:#8fa3ba;
          --alta:#2fbf71; --media:#efb034; --revisar:#8fa3ba; --urgente:#e5484d; }
  * { box-sizing:border-box; margin:0; }
  body { background:var(--bg); color:var(--text); font-family:system-ui,Segoe UI,sans-serif; padding:24px; }
  .wrap { max-width:920px; margin:0 auto; }
  h1 { font-size:22px; display:flex; align-items:center; gap:10px; }
  .selo { font-size:11px; letter-spacing:1px; background:var(--alta); color:#04160c; padding:3px 8px; border-radius:99px; }
  .sub { color:var(--muted); font-size:13px; margin:6px 0 16px; }
  .metros { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:10px; margin-bottom:16px; }
  .metro { background:var(--surface); border:1px solid var(--line); border-radius:12px; padding:12px 14px; }
  .metro b { font-size:22px; display:block; }
  .metro span { font-size:12px; color:var(--muted); }
  .filtros { display:flex; gap:8px; margin-bottom:14px; }
  .filtros button { background:var(--surface); border:1px solid var(--line); color:var(--muted); padding:6px 14px; border-radius:99px; cursor:pointer; font-size:13px; }
  .filtros button.on { color:var(--text); border-color:var(--alta); }
  .card { background:var(--surface); border:1px solid var(--line); border-radius:12px; padding:16px; margin-bottom:14px; }
  .card h2 { font-size:16px; margin:8px 0 6px; }
  .card h2 a { color:var(--text); }
  .badge { font-size:11px; letter-spacing:1px; padding:3px 9px; border-radius:99px; font-weight:600; }
  .b-alta { background:var(--alta); color:#04160c; }
  .b-media { background:var(--media); color:#2b1d02; }
  .b-revisar { background:#24344a; color:var(--muted); }
  .proj { color:var(--muted); font-size:13px; margin-left:8px; }
  .why { font-size:14px; margin:4px 0; }
  .prazo { font-size:13px; color:var(--media); margin:4px 0; }
  .prazo.urgente { color:var(--urgente); font-weight:600; }
  .motivos { font-size:13px; color:var(--muted); margin:4px 0; }
  .comp { font-size:12px; color:var(--muted); margin:6px 0; }
  ol { margin:8px 0 0 20px; font-size:13.5px; color:var(--muted); line-height:1.8; }
  .vazio { color:var(--muted); }
</style>
</head>
<body>
<div class="wrap">
  <h1>🎯 EDITAL MATCH <span class="selo">SOBERANO</span></h1>
  <p class="sub" id="sub">carregando…</p>
  <div class="metros" id="metros"></div>
  <div class="filtros" id="filtros"></div>
  <div id="lista"><p class="vazio">carregando…</p></div>
</div>
<script>
var FILTRO = 'todas';
var DADOS = null;
function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function dias(prazo) {
  if (!prazo) return null;
  var ms = new Date(prazo + 'T23:59:59') - new Date();
  return Math.ceil(ms / 86400000);
}
function rank(b) { return b === 'alta' ? 0 : (b === 'media' ? 1 : 2); }
function render() {
  if (!DADOS) return;
  var avs = DADOS.avaliacoes.slice().sort(function (a, b) { return rank(a.badge) - rank(b.badge) || b.total - a.total; });
  var contas = { alta: 0, media: 0, revisar: 0 };
  avs.forEach(function (a) { contas[a.badge] += 1; });
  document.getElementById('sub').innerHTML = 'avaliado em ' + esc(DADOS.geradoEm)
    + ' · portfólio: ' + DADOS.totalProjetos + ' projetos · juiz: 100% local';
  document.getElementById('metros').innerHTML =
    '<div class="metro"><b style="color:var(--alta)">' + contas.alta + '</b><span>alta chance</span></div>'
    + '<div class="metro"><b style="color:var(--media)">' + contas.media + '</b><span>média chance</span></div>'
    + '<div class="metro"><b>' + contas.revisar + '</b><span>revisar elegibilidade</span></div>'
    + '<div class="metro"><b>' + avs.length + '</b><span>editais no banco</span></div>';
  var fs = ['todas', 'alta', 'media', 'revisar'];
  document.getElementById('filtros').innerHTML = fs.map(function (f) {
    return '<button class="' + (FILTRO === f ? 'on' : '') + '" onclick="FILTRO=\\'' + f + '\\';render()">' + f + '</button>';
  }).join('');
  var mostra = avs.filter(function (a) { return FILTRO === 'todas' || a.badge === FILTRO; });
  if (!mostra.length) {
    document.getElementById('lista').innerHTML = '<p class="vazio">nada neste filtro ainda — rode: node dist/cli.js coleta &amp;&amp; node dist/cli.js match</p>';
    return;
  }
  document.getElementById('lista').innerHTML = mostra.map(function (a) {
    var d = dias(a.edital.prazo);
    var prazoTxt = a.edital.prazo
      ? (d >= 0 ? a.edital.prazo + ' (' + d + ' dia' + (d === 1 ? '' : 's') + ' restante' + (d === 1 ? '' : 's') + ')' : a.edital.prazo + ' (encerrado)')
      : 'verificar na página';
    var urgente = d !== null && d >= 0 && d <= 7;
    return '<div class="card">'
      + '<span class="badge b-' + a.badge + '">' + a.badge.toUpperCase() + (a.total ? ' · ' + a.total : '') + '</span>'
      + (a.projeto ? '<span class="proj">projeto: ' + esc(a.projeto) + '</span>' : '')
      + '<h2><a href="' + esc(a.edital.url) + '" target="_blank" rel="noopener noreferrer">' + esc(a.edital.titulo) + '</a></h2>'
      + '<p class="why">' + esc(a.porQue) + '</p>'
      + '<p class="prazo' + (urgente ? ' urgente' : '') + '">prazo: ' + esc(prazoTxt) + '</p>'
      + (a.elegibilidade.motivos.length ? '<p class="motivos">⛔ ' + a.elegibilidade.motivos.map(esc).join(' · ') + '</p>' : '')
      + (a.total ? '<p class="comp">alinhamento ' + a.score.alinhamento + '/25 · impacto ' + a.score.impacto + '/20 · competitividade ' + a.score.competitividade + '/20 · viabilidade ' + a.score.viabilidade + '/15 · histórico ' + a.score.historico + '/10 · diversidade ' + a.score.diversidade + '/10</p>' : '')
      + (a.passos.length ? '<ol>' + a.passos.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ol>' : '')
      + '</div>';
  }).join('');
}
function tick() {
  fetch('/api/status').then(function (r) { return r.json(); }).then(function (s) { DADOS = s; render(); }).catch(function () {});
}
tick();
setInterval(tick, 5000);
</script>
</body>
</html>`;

export function startServer(state: AppState, porta: number): Server {
  const server = createServer((req, res) => {
    if (req.url === '/api/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(state));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(PAGINA);
  });
  server.listen(porta);
  return server;
}
