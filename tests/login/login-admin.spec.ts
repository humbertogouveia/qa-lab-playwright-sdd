// spec: specs/login.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Caminho feliz', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/login');
  });

  test('Login valido como admin e diferencas por perfil', async ({ page }) => {
    // 1. Fazer login com TEST_ADMIN_EMAIL e TEST_ADMIN_PASSWORD
    await page.getByLabel('E-mail').fill(process.env.TEST_ADMIN_EMAIL!);
    await page.getByLabel('Senha').fill(process.env.TEST_ADMIN_PASSWORD!);
    await page.locator('#login-form').getByRole('button', { name: 'Entrar' }).click();

    // expect: Redireciona para /#/ com 'Olá, Admin Teste'
    await expect(page).toHaveURL(/\/#\/$/);
    await expect(page.getByTestId('user-name')).toHaveText('Olá, Admin Teste');

    // expect: sessionStorage.user.role = 'admin'
    const role = await page.evaluate(
      () => JSON.parse(sessionStorage.getItem('user') ?? '{}').role,
    );
    expect(role).toBe('admin');

    // expect: Cabecalho identico ao do cliente (sem item exclusivo de admin)
    await expect(page.getByTestId('nav-orders')).toBeVisible();
    await expect(page.getByTestId('logout')).toBeVisible();
    await expect(page.getByTestId('nav-login')).toBeHidden();
    await expect(page.getByTestId('nav-register')).toBeHidden();
    await expect(
      page.getByRole('navigation', { name: 'Navegação principal' }).getByRole('link', { name: /admin/i }),
    ).toHaveCount(0);

    // 2. Abrir /#/admin, /#/admin/products e /#/admin/orders
    for (const route of ['/#/admin', '/#/admin/products', '/#/admin/orders']) {
      await page.goto(route);

      // expect: Cada rota exibe h1 'Página não encontrada'
      await expect(page.getByRole('heading', { level: 1, name: 'Página não encontrada' })).toBeVisible();
    }
  });
});
