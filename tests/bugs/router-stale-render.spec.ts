// Bug encontrado ao estabilizar tests/login/logout.spec.ts (não faz parte do catálogo de bugs propositais).
//
// Causa: o roteador do front (qa-lab-app/public/app.js, função route) é assíncrono e não descarta
// renderizações de rotas antigas. O catálogo escreve "Catálogo" na hora e, quando os produtos chegam,
// sobrescreve o conteúdo da página, mesmo que o usuário já esteja em outra rota.
//
// Como o usuário vê: logo após sair (logout leva ao catálogo), apertar Voltar ou abrir o login.
// A URL fica em /#/login, mas a tela mostra o Catálogo.
//
// Como o teste reproduz sempre: atrasa a resposta de /api/products, garantindo que ela chegue
// depois da troca de rota. Sem o atraso, o bug só aparece de forma intermitente, sob carga.

import { test, expect } from '@playwright/test';

const PRODUCTS_DELAY_MS = 1_000;

test.describe('Bugs conhecidos', () => {
  test('Troca de rota durante carregamento do catalogo nao deve sobrescrever a nova tela', async ({ page }) => {
    test.fail(true, 'Bug: renderização atrasada do catálogo sobrescreve a rota atual (app.js, route). Remover quando corrigido.');
    test.info().annotations.push({ type: 'bug', description: 'Condição de corrida no roteador do front: rota antiga sobrescreve a atual' });

    // Atrasa só a lista de produtos; o resto da API responde normalmente
    await page.route('**/api/products?**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, PRODUCTS_DELAY_MS));
      await route.continue();
    });

    // 1. Abrir o catálogo: o título aparece e os produtos ficam carregando
    const productsResponse = page.waitForResponse((res) => res.url().includes('/api/products?'));
    await page.goto('/#/');
    await expect(page.getByRole('heading', { level: 1, name: 'Catálogo' })).toBeVisible();

    // 2. Ir para o login antes de os produtos chegarem
    await page.goto('/#/login');
    await expect(page.getByRole('heading', { level: 1, name: 'Entrar' })).toBeVisible();

    // 3. Deixar a resposta atrasada do catálogo chegar
    await productsResponse;

    // expect: a tela continua sendo a do login, coerente com a URL
    await expect(page).toHaveURL(/\/#\/login$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Entrar' })).toBeVisible();
    await expect(page.getByLabel('E-mail')).toBeVisible();
    await expect(page.getByTestId('product-card')).toHaveCount(0);
  });
});
