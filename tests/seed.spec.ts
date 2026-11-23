import { test } from './support/fixtures';

/**
 * Seed usado pelos agentes (planner/generator) como ponto de partida: abre a tela de login.
 *
 * Testes gerados devem importar `test` e `expect` de `tests/support/fixtures` e usar:
 * - `loginPage` e `header` (page objects) em vez de seletores soltos;
 * - `users('cliente' | 'admin')` para credenciais (nunca process.env direto nem valores literais);
 * - `loginAs(role)` quando o login for pré-condição, e não o que está sendo testado.
 *
 * O reset do app acontece uma única vez no globalSetup (tests/global-setup.ts), não aqui,
 * para não derrubar sessões de testes rodando em paralelo.
 */
test.describe('Test group', () => {
  test('seed', async ({ loginPage }) => {
    await loginPage.goto();

    // generate code here.
  });
});
