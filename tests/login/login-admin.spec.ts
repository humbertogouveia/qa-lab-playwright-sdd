// spec: specs/login.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../support/fixtures';

test.describe('Caminho feliz', () => {
  test('Login valido como admin e diferencas por perfil', async ({ page, loginPage, header, users }) => {
    const admin = users('admin');
    await loginPage.goto();

    // 1. Fazer login com TEST_ADMIN_EMAIL e TEST_ADMIN_PASSWORD
    await loginPage.submit(admin.email, admin.password);

    // expect: Redireciona para /#/ com 'Olá, Admin Teste'
    await expect(page).toHaveURL(/\/#\/$/);

    // expect: Cabecalho identico ao do cliente (sem item exclusivo de admin)
    await header.expectLoggedIn(admin.name);
    await expect(
      page.getByRole('navigation', { name: 'Navegação principal' }).getByRole('link', { name: /admin/i }),
    ).toHaveCount(0);

    // expect: sessionStorage.user.role = 'admin'
    const role = await page.evaluate(() => JSON.parse(sessionStorage.getItem('user') ?? '{}').role);
    expect(role).toBe(admin.apiRole);

    // 2. Abrir /#/admin, /#/admin/products e /#/admin/orders
    for (const route of ['/#/admin', '/#/admin/products', '/#/admin/orders']) {
      await page.goto(route);

      // expect: Cada rota exibe h1 'Página não encontrada'
      await expect(page.getByRole('heading', { level: 1, name: 'Página não encontrada' })).toBeVisible();
    }
  });
});
