// spec: specs/login.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Caminho feliz', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/login');
  });

  test('Login valido como cliente', async ({ page, context }) => {
    // 1. Preencher e-mail e senha do cliente e clicar em 'Entrar'
    await page.getByLabel('E-mail').fill(process.env.TEST_CLIENTE_EMAIL!);
    await page.getByLabel('Senha').fill(process.env.TEST_CLIENTE_PASSWORD!);
    await page.locator('#login-form').getByRole('button', { name: 'Entrar' }).click();

    // expect: URL passa a /#/ e h1 'Catálogo' e exibido
    await expect(page).toHaveURL(/\/#\/$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Catálogo' })).toBeVisible();

    // expect: Cabecalho mostra 'Olá, Cliente Teste', 'Meus pedidos' e 'Sair'; 'Entrar' e 'Cadastrar' somem
    await expect(page.getByTestId('user-name')).toHaveText('Olá, Cliente Teste');
    await expect(page.getByTestId('nav-orders')).toBeVisible();
    await expect(page.getByTestId('logout')).toBeVisible();
    await expect(page.getByTestId('nav-login')).toBeHidden();
    await expect(page.getByTestId('nav-register')).toBeHidden();

    // expect: sessionStorage contem exatamente token e user (role 'customer'); localStorage e cookies vazios
    const session = await page.evaluate(() => ({
      keys: Object.keys(sessionStorage).sort(),
      user: JSON.parse(sessionStorage.getItem('user') ?? '{}'),
      localKeys: Object.keys(localStorage),
    }));
    expect(session.keys).toEqual(['token', 'user']);
    expect(session.user.role).toBe('customer');
    expect(session.localKeys).toEqual([]);
    expect(await context.cookies()).toEqual([]);
  });
});
