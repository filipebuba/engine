import { describe, it, expect } from 'vitest';
import { cli } from './cli.js';

describe('cli', () => {
  it('sem argumento imprime uso e devolve 1', async () => {
    expect(await cli([])).toBe(1);
  });
  it('comando desconhecido devolve 1', async () => {
    expect(await cli(['dança'])).toBe(1);
  });
});
