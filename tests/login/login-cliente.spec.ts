// spec: specs/login.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../support/fixtures';

test.describe('Caminho feliz', () => {
  test('Login valido como cliente', async ({ page, context, loginPage, header, users }) => {
    const cliente = users('cliente');
    await loginPage.goto();

    // 1. Preencher e-mail e senha do cliente e clicar em 'Entrar'
    await loginPage.submit(cliente.email, cliente.password);

    // expect: URL passa a /#/ e h1 'Catálogo' e exibido
    await expect(page).toHaveURL(/\/#\/$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Catálogo' })).toBeVisible();

    // expect: Cabecalho mostra 'Olá, Cliente Teste', 'Meus pedidos' e 'Sair'; 'Entrar' e 'Cadastrar' somem
    await header.expectLoggedIn(cliente.name);

    // expect: sessionStorage contem exatamente token e user (role 'customer'); localStorage e cookies vazios
    const session = await page.evaluate(() => ({
      keys: Object.keys(sessionStorage).sort(),
      user: JSON.parse(sessionStorage.getItem('user') ?? '{}'),
      localKeys: Object.keys(localStorage),
    }));
    expect(session.keys).toEqual(['token', 'user']);
    expect(session.user.role).toBe(cliente.apiRole);
    expect(session.localKeys).toEqual([]);
    expect(await context.cookies()).toEqual([]);
  });
});
