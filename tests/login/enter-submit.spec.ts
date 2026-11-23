// spec: specs/login.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Caminho feliz', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/login');
  });

  test('Envio com a tecla Enter', async ({ page }) => {
    // 1. Preencher credenciais validas e pressionar Enter em #password
    await page.getByLabel('E-mail').fill(process.env.TEST_CLIENTE_EMAIL!);
    const password = page.getByLabel('Senha');
    await password.fill(process.env.TEST_CLIENTE_PASSWORD!);
    await password.press('Enter');

    // expect: Login ocorre como no clique, redirecionando para /#/
    await expect(page).toHaveURL(/\/#\/$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Catálogo' })).toBeVisible();
    await expect(page.getByTestId('user-name')).toHaveText('Olá, Cliente Teste');
    await expect(page.getByTestId('logout')).toBeVisible();
  });
});
