// spec: specs/login.plan.md
// seed: tests/seed.spec.ts

import { test, expect, type Page } from '@playwright/test';

async function loginAsCliente(page: Page) {
  await page.goto('/#/login');
  await page.getByLabel('E-mail').fill(process.env.TEST_CLIENTE_EMAIL!);
  await page.getByLabel('Senha').fill(process.env.TEST_CLIENTE_PASSWORD!);
  await page.locator('#login-form').getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/#\/$/);
  await expect(page.getByTestId('logout')).toBeVisible();
}

async function expectLoggedOutHeader(page: Page) {
  await expect(page.getByTestId('nav-login')).toBeVisible();
  await expect(page.getByTestId('nav-register')).toBeVisible();
  await expect(page.getByTestId('logout')).toBeHidden();
  await expect(page.getByTestId('nav-orders')).toBeHidden();
}

test.describe('Caminho feliz', () => {
  test('Logout encerra a sessao', async ({ page }) => {
    // 1. Logar como cliente e clicar em 'Sair' (data-testid=logout)
    await loginAsCliente(page);
    await page.getByTestId('logout').click();

    // expect: Vai para /#/, sessionStorage sem token/user, cabecalho volta a 'Entrar' e 'Cadastrar'
    // A URL já era /#/ antes do logout: espera o cabeçalho e repete a leitura do storage até limpar
    await expectLoggedOutHeader(page);
    await expect(page).toHaveURL(/\/#\/$/);
    await expect
      .poll(() =>
        page.evaluate(() => ({
          token: sessionStorage.getItem('token'),
          user: sessionStorage.getItem('user'),
        })),
      )
      .toEqual({ token: null, user: null });

    // 2. Abrir /#/orders e usar o botao Voltar
    await page.goto('/#/orders');

    // expect: /#/orders redireciona para /#/login?reason=auth
    await expect(page).toHaveURL(/\/#\/login\?reason=auth$/);
    await page.goBack();

    // expect: Voltar permanece em /#/login?reason=auth e nao concede acesso a area protegida
    await expect(page).toHaveURL(/\/#\/login\?reason=auth$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Entrar' })).toBeVisible();
    await expectLoggedOutHeader(page);

    // 3. Logar, abrir /#/orders, clicar em 'Sair' e usar Voltar
    await loginAsCliente(page);
    await page.goto('/#/orders');
    await expect(page.getByTestId('logout')).toBeVisible();
    await page.getByTestId('logout').click();
    await expect(page.getByTestId('logout')).toBeHidden();
    // O app esconde o "Sair" antes de navegar para #/: espera a navegação E a renderização do
    // catálogo terminarem antes do Voltar. O título "Catálogo" aparece antes dos produtos, então o
    // sinal de fim é o primeiro card. Sem isso, a resposta tardia do catálogo sobrescreve a tela de
    // login (bug de corrida no roteador do app, registrado à parte).
    await expect(page).toHaveURL(/\/#\/$/);
    await expect(page.getByTestId('product-card').first()).toBeVisible();
    await page.goBack();

    // expect: Observado: Voltar leva a /#/login?reason=auth, cabecalho deslogado, sem dados de pedidos
    test.info().annotations.push({
      type: 'observed',
      description:
        'Voltar após logout em /#/orders leva a /#/login?reason=auth (entrada de histórico criada pelo redirecionamento)',
    });
    await expect(page).toHaveURL(/\/#\/login\?reason=auth$/);
    await expectLoggedOutHeader(page);
    await expect(page.getByRole('heading', { level: 1, name: 'Entrar' })).toBeVisible();
  });
});
