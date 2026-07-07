import { describe, it, expect } from 'vitest';
import { startServer, type AppState } from './server.js';
import { SCORE_ZERO } from './match.js';
import { parseEdital } from './edital.js';

describe('startServer', () => {
  it('serve a página e o status JSON', async () => {
    const state: AppState = {
      geradoEm: '2026-07-06 21:00',
      totalProjetos: 52,
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

    const res = await fetch(`http://127.0.0.1:${porta}/`);
    const html = await res.text();
    expect(res.headers.get('content-type')).toContain('text/html');
    expect(html).toContain('EDITAL MATCH');
    expect(html).toContain('/api/status');

    server.close();
  });
});
