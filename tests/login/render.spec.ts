// spec: specs/login.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Caminho feliz', () => {
  test('Renderizacao da tela de login', async ({ page }) => {
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
    await page.goto('/#/login');

    // expect: Titulo da pagina 'QA Lab Store' e h1 'Entrar'
    await expect(page).toHaveTitle('QA Lab Store');
    await expect(page.getByRole('heading', { level: 1, name: 'Entrar' })).toBeVisible();

    // expect: Campos E-mail e Senha e botao 'Entrar' visiveis
    const email = page.getByLabel('E-mail');
    const password = page.getByLabel('Senha');
    const form = page.locator('#login-form');
    await expect(email).toBeVisible();
    await expect(password).toBeVisible();
    await expect(form.getByRole('button', { name: 'Entrar' })).toBeVisible();

    // expect: atributos de acessibilidade/formulario
    await expect(password).toHaveAttribute('type', 'password');
    await expect(email).toHaveAttribute('autocomplete', 'username');
    await expect(password).toHaveAttribute('autocomplete', 'current-password');
    await expect(form).toHaveAttribute('novalidate', '');

    // expect: #form-error (role=alert) vazio
    await expect(page.getByTestId('form-error')).toHaveAttribute('role', 'alert');
    await expect(page.getByTestId('form-error')).toBeEmpty();

    // expect: Cabecalho com 'Entrar' e 'Cadastrar'; sem 'Meus pedidos' e 'Sair' visiveis
    await expect(page.getByTestId('nav-login')).toBeVisible();
    await expect(page.getByTestId('nav-register')).toBeVisible();
    await expect(page.getByTestId('nav-orders')).toBeHidden();
    await expect(page.getByTestId('logout')).toBeHidden();
    await expect(page.getByTestId('nav-orders')).toBeAttached();
    await expect(page.getByTestId('logout')).toBeAttached();

    // expect: Nao ha mostrar/ocultar senha, esqueci a senha ou lembrar-me
    await expect(page.getByText(/mostrar|ocultar|esqueci|lembrar/i)).toHaveCount(0);
    await expect(page.getByRole('checkbox')).toHaveCount(0);

    // expect: Unico erro de console tolerado: 404 de /favicon.ico
    expect(consoleErrors).toEqual([]);
  });
});
