// spec: specs/login.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../support/fixtures';

test.describe('Caminho feliz', () => {
  test('Logout encerra a sessao', async ({ page, loginPage, header, loginAs }) => {
    // 1. Logar como cliente e clicar em 'Sair' (data-testid=logout)
    await loginAs('cliente');
    await header.logout.click();

    // expect: Vai para /#/, sessionStorage sem token/user, cabecalho volta a 'Entrar' e 'Cadastrar'
    // A URL já era /#/ antes do logout: espera o cabeçalho e repete a leitura do storage até limpar
    await header.expectLoggedOut();
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
    await expect(loginPage.heading).toBeVisible();
    await header.expectLoggedOut();

    // 3. Logar, abrir /#/orders, clicar em 'Sair' e usar Voltar
    await loginAs('cliente');
    await page.goto('/#/orders');
    await expect(header.logout).toBeVisible();
    await header.logout.click();
    await expect(header.logout).toBeHidden();
    // O app esconde o "Sair" antes de navegar para #/: espera a navegação E a renderização do
    // catálogo terminarem antes do Voltar. O título "Catálogo" aparece antes dos produtos, então o
    // sinal de fim é o primeiro card. Sem isso, a resposta tardia do catálogo sobrescreve a tela de
    // login (bug de corrida no roteador do app: tests/bugs/router-stale-render.spec.ts).
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
    await header.expectLoggedOut();
    await expect(loginPage.heading).toBeVisible();
  });
});
