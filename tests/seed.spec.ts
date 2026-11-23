import { test } from '@playwright/test';

/**
 * Seed usado pelos agentes (planner/generator) como ponto de partida:
 * restaura os dados do app, desliga os bugs e abre a tela de login.
 */
test.describe('Test group', () => {
  test('seed', async ({ page, request }) => {
    await request.post('/api/test/reset');
    await page.goto('/#/login');

    // generate code here.
  });
});
