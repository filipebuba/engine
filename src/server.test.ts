import { describe, it, expect } from 'vitest';
import { startServer, type AppState } from './server.js';
import { SCORE_ZERO } from './match.js';
import { parseEdital } from './edital.js';

describe('startServer', () => {
  it('serve a página e o status JSON', async () => {
    const state: AppState = {
      geradoEm: '2026-07-06 21:00',
      totalProjetos: 52,
      projetos: [{ nome: 'demo', oQueE: 'app', problema: '', stack: '', estado: 'protótipo', palavrasChave: ['pme'] }],
      avaliacoes: [{
        edital: parseEdital({ id: 'x', titulo: 'Edital Teste', fonte: 'f', url: 'https://ex.com', prazo: '2026-09-30' }),
        elegibilidade: { elegivel: true, motivos: [] },
        projeto: 'SoberanIA',
        score: { ...SCORE_ZERO, alinhamento: 25 },
        total: 25,
        badge: 'revisar',
        porQue: 'teste',
        passos: ['abrir o edital'],
      }],
    };
    const server = startServer(state, 0);
    await new Promise<void>((r) => server.on('listening', r));
    const addr = server.address();
    const porta = typeof addr === 'object' && addr ? addr.port : 0;

    const api = await (await fetch(`http://127.0.0.1:${porta}/api/status`)).json() as AppState;
    expect(api.totalProjetos).toBe(52);
    expect(api.avaliacoes).toHaveLength(1);

    const projetos = await (await fetch(`http://127.0.0.1:${porta}/api/projetos`)).json() as unknown[];
    expect(projetos).toHaveLength(1);

    const res = await fetch(`http://127.0.0.1:${porta}/`);
    const html = await res.text();
    expect(res.headers.get('content-type')).toContain('text/html');
    expect(html).toContain('EDITAL MATCH');
    expect(html).toContain('/api/status');
    expect(html).toContain('id="busca"');
    expect(html).toContain('data-acao="csv"');
    expect(html).toContain('data-acao="tema"');
    expect(html).toContain('role="dialog"');
    expect(html).toContain('class="skip"');

    server.close();
  });

  it('POST /api/pesquisar dispara a ação assíncrona e reporta etapas', async () => {
    const state: AppState = { geradoEm: 'antes', totalProjetos: 0, avaliacoes: [] };
    const server = startServer(state, 0, {
      pesquisar: async (etapa) => {
        etapa('trabalhando');
        await new Promise((r) => setTimeout(r, 30));
        state.geradoEm = 'depois';
      },
    });
    await new Promise<void>((r) => server.on('listening', r));
    const addr = server.address();
    const porta = typeof addr === 'object' && addr ? addr.port : 0;

    const disparo = await fetch(`http://127.0.0.1:${porta}/api/pesquisar`, { method: 'POST' });
    expect(disparo.status).toBe(202);

    const ocupado = await fetch(`http://127.0.0.1:${porta}/api/pesquisar`, { method: 'POST' });
    expect(ocupado.status).toBe(409);

    for (let i = 0; i < 50; i++) {
      const s = (await (await fetch(`http://127.0.0.1:${porta}/api/status`)).json()) as AppState;
      if (s.pesquisa && !s.pesquisa.rodando && s.pesquisa.terminadaEm) break;
      await new Promise((r) => setTimeout(r, 20));
    }
    const fim = (await (await fetch(`http://127.0.0.1:${porta}/api/status`)).json()) as AppState;
    expect(fim.geradoEm).toBe('depois');
    expect(fim.pesquisa?.etapa).toBe('concluída');

    const semAcao = await fetch(`http://127.0.0.1:${porta}/api/sincronizar`, { method: 'POST' });
    expect(semAcao.status).toBe(404);

    server.close();
  });
});
