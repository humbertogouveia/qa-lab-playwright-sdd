import { expect, type Locator, type Page } from '@playwright/test';

/** Cabeçalho da loja, presente em todas as telas. */
export class Header {
  readonly login: Locator;
  readonly register: Locator;
  readonly orders: Locator;
  readonly userName: Locator;
  readonly logout: Locator;

  constructor(page: Page) {
    this.login = page.getByTestId('nav-login');
    this.register = page.getByTestId('nav-register');
    this.orders = page.getByTestId('nav-orders');
    this.userName = page.getByTestId('user-name');
    this.logout = page.getByTestId('logout');
  }

  /** Cabeçalho autenticado: saudação com o nome, "Meus pedidos" e "Sair"; sem "Entrar"/"Cadastrar". */
  async expectLoggedIn(name: string) {
    await expect(this.userName).toHaveText(`Olá, ${name}`);
    await expect(this.orders).toBeVisible();
    await expect(this.logout).toBeVisible();
    await expect(this.login).toBeHidden();
    await expect(this.register).toBeHidden();
  }

  /** Cabeçalho de visitante: "Entrar" e "Cadastrar"; sem "Meus pedidos"/"Sair". */
  async expectLoggedOut() {
    await expect(this.login).toBeVisible();
    await expect(this.register).toBeVisible();
    await expect(this.orders).toBeHidden();
    await expect(this.logout).toBeHidden();
  }
}
