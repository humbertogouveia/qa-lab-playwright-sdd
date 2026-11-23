import { test as base, expect } from '@playwright/test';
import { Header } from './pages/header';
import { LoginPage } from './pages/login-page';
import { getUser, type Role, type TestUser } from './users';

type Fixtures = {
  /** Page object da tela de login. */
  loginPage: LoginPage;
  /** Page object do cabeçalho. */
  header: Header;
  /** Usuários de teste por perfil, com credenciais lidas do ambiente. */
  users: (role: Role) => TestUser;
  /**
   * Faz login PELA TELA e espera a sessão estar ativa (catálogo + "Sair").
   * Use quando o login é pré-condição do teste. Quando o próprio login é o que está
   * sendo testado, use loginPage.submit() e verifique o resultado no teste.
   */
  loginAs: (role: Role) => Promise<TestUser>;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  header: async ({ page }, use) => {
    await use(new Header(page));
  },

  users: async ({}, use) => {
    await use(getUser);
  },

  loginAs: async ({ page, loginPage, header }, use) => {
    await use(async (role) => {
      const user = getUser(role);
      await loginPage.goto();
      await loginPage.submit(user.email, user.password);
      await expect(page).toHaveURL(/\/#\/$/);
      await expect(header.logout).toBeVisible();
      return user;
    });
  },
});

export { expect };
