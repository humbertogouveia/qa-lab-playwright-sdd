// spec: specs/login.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Caminho feliz', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/login');
  });

  test('Sessao persiste apos recarregar e /#/login ja logado', async ({ page }) => {
    // 1. Logar como cliente e recarregar a pagina (F5)
    await page.getByLabel('E-mail').fill(process.env.TEST_CLIENTE_EMAIL!);
    await page.getByLabel('Senha').fill(process.env.TEST_CLIENTE_PASSWORD!);
    await page.locator('#login-form').getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/\/#\/$/);

    await page.reload();

    // expect: Continua autenticado
    await expect(page.getByTestId('logout')).toBeVisible();
    await expect(page.getByTestId('user-name')).toHaveText('Olá, Cliente Teste');

    // expect: sessionStorage mantem token e user
    const keys = await page.evaluate(() => Object.keys(sessionStorage).sort());
    expect(keys).toEqual(['token', 'user']);

    // 2. Navegar para /#/login ja logado
    await page.goto('/#/login');

    // expect: Observado: NAO ha redirecionamento; formulario exibido com cabecalho logado
    test.info().annotations.push({
      type: 'observed',
      description:
        'Sem redirecionamento de /#/login com sessão ativa; pergunta em aberto 5 de specs/login.requirements.md',
    });
    await expect(page).toHaveURL(/\/#\/login$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Entrar' })).toBeVisible();
    await expect(page.locator('#login-form')).toBeVisible();
    await expect(page.getByTestId('user-name')).toHaveText('Olá, Cliente Teste');
    await expect(page.getByTestId('logout')).toBeVisible();
  });
});
