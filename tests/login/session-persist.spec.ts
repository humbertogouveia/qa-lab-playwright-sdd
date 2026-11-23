// spec: specs/login.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../support/fixtures';

test.describe('Caminho feliz', () => {
  test('Sessao persiste apos recarregar e /#/login ja logado', async ({ page, loginPage, header, loginAs }) => {
    // 1. Logar como cliente e recarregar a pagina (F5)
    const cliente = await loginAs('cliente');
    await page.reload();

    // expect: Continua autenticado
    await header.expectLoggedIn(cliente.name);

    // expect: sessionStorage mantem token e user
    const keys = await page.evaluate(() => Object.keys(sessionStorage).sort());
    expect(keys).toEqual(['token', 'user']);

    // 2. Navegar para /#/login ja logado
    await loginPage.goto();

    // expect: Observado: NAO ha redirecionamento; formulario exibido com cabecalho logado
    test.info().annotations.push({
      type: 'observed',
      description:
        'Sem redirecionamento de /#/login com sessão ativa; pergunta em aberto 5 de specs/login.requirements.md',
    });
    await expect(page).toHaveURL(/\/#\/login$/);
    await expect(loginPage.heading).toBeVisible();
    await expect(loginPage.form).toBeVisible();
    await header.expectLoggedIn(cliente.name);
  });
});
