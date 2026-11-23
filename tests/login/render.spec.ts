// spec: specs/login.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../support/fixtures';

test.describe('Caminho feliz', () => {
  test('Renderizacao da tela de login', async ({ page, loginPage, header }) => {
    // Coleta erros de console antes de abrir a pagina
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() !== 'error') return;
      const isFaviconNotFound =
        msg.location().url.includes('/favicon.ico') && /404/.test(msg.text());
      if (!isFaviconNotFound) consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    // 1. Abrir http://localhost:3000/#/login em contexto limpo
    await loginPage.goto();

    // expect: Titulo da pagina 'QA Lab Store' e h1 'Entrar'
    await expect(page).toHaveTitle('QA Lab Store');
    await expect(loginPage.heading).toBeVisible();

    // expect: Campos E-mail e Senha e botao 'Entrar' visiveis
    await expect(loginPage.email).toBeVisible();
    await expect(loginPage.password).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();

    // expect: atributos de acessibilidade/formulario
    await expect(loginPage.password).toHaveAttribute('type', 'password');
    await expect(loginPage.email).toHaveAttribute('autocomplete', 'username');
    await expect(loginPage.password).toHaveAttribute('autocomplete', 'current-password');
    await expect(loginPage.form).toHaveAttribute('novalidate', '');

    // expect: #form-error (role=alert) vazio
    await expect(loginPage.formError).toHaveAttribute('role', 'alert');
    await expect(loginPage.formError).toBeEmpty();

    // expect: Cabecalho com 'Entrar' e 'Cadastrar'; sem 'Meus pedidos' e 'Sair' visiveis (existem no DOM com hidden)
    await header.expectLoggedOut();
    await expect(header.orders).toBeAttached();
    await expect(header.logout).toBeAttached();

    // expect: Nao ha mostrar/ocultar senha, esqueci a senha ou lembrar-me
    await expect(page.getByText(/mostrar|ocultar|esqueci|lembrar/i)).toHaveCount(0);
    await expect(page.getByRole('checkbox')).toHaveCount(0);

    // expect: Unico erro de console tolerado: 404 de /favicon.ico
    expect(consoleErrors).toEqual([]);
  });
});
