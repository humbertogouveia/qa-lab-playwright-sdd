// spec: specs/login.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../support/fixtures';

test.describe('Caminho feliz', () => {
  test('Envio com a tecla Enter', async ({ page, loginPage, header, users }) => {
    const cliente = users('cliente');
    await loginPage.goto();

    // 1. Preencher credenciais validas e pressionar Enter em #password
    await loginPage.submitWithEnter(cliente.email, cliente.password);

    // expect: Login ocorre como no clique, redirecionando para /#/
    await expect(page).toHaveURL(/\/#\/$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Catálogo' })).toBeVisible();
    await header.expectLoggedIn(cliente.name);
  });
});
