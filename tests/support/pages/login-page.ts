import { type Locator, type Page } from '@playwright/test';

/** Tela de login (/#/login). */
export class LoginPage {
  readonly heading: Locator;
  readonly form: Locator;
  readonly email: Locator;
  readonly password: Locator;
  /** Escopado ao formulário: o cabeçalho também tem um link "Entrar". */
  readonly submitButton: Locator;
  readonly formError: Locator;
  readonly notice: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1, name: 'Entrar' });
    this.form = page.locator('#login-form');
    this.email = page.getByLabel('E-mail');
    this.password = page.getByLabel('Senha');
    this.submitButton = this.form.getByRole('button', { name: 'Entrar' });
    this.formError = page.getByTestId('form-error');
    this.notice = page.getByTestId('login-notice');
  }

  async goto() {
    await this.page.goto('/#/login');
  }

  async fill(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
  }

  /** Preenche e envia clicando em "Entrar". Não espera o resultado: cada teste verifica o que espera. */
  async submit(email: string, password: string) {
    await this.fill(email, password);
    await this.submitButton.click();
  }

  /** Preenche e envia com Enter no campo de senha. */
  async submitWithEnter(email: string, password: string) {
    await this.fill(email, password);
    await this.password.press('Enter');
  }
}
