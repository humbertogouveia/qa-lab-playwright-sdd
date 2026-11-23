import { test } from '@playwright/test';

/**
 * Seed usado pelos agentes (planner/generator) como ponto de partida: abre a tela de login.
 * O reset do app acontece uma única vez no globalSetup (tests/global-setup.ts), não aqui,
 * para não derrubar sessões de testes rodando em paralelo.
 */
test.describe('Test group', () => {
  test('seed', async ({ page }) => {
    await page.goto('/#/login');

    // generate code here.
  });
});
