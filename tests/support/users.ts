/**
 * Usuários de teste. Credenciais vêm SEMPRE de variáveis de ambiente
 * (.env localmente, secrets no GitHub Actions); nome e perfil são da carga inicial do app.
 */

export type Role = 'cliente' | 'admin';

export interface TestUser {
  email: string;
  password: string;
  /** Nome exibido no cabeçalho ("Olá, <nome>") */
  name: string;
  /** Perfil retornado pela API em user.role */
  apiRole: 'customer' | 'admin';
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Variável de ambiente ${name} não definida. Copie .env.example para .env e preencha, ou configure o secret no CI.`,
    );
  }
  return value;
}

/** Lido sob demanda: um teste que não usa um perfil não exige as variáveis dele. */
export function getUser(role: Role): TestUser {
  switch (role) {
    case 'cliente':
      return {
        email: requireEnv('TEST_CLIENTE_EMAIL'),
        password: requireEnv('TEST_CLIENTE_PASSWORD'),
        name: 'Cliente Teste',
        apiRole: 'customer',
      };
    case 'admin':
      return {
        email: requireEnv('TEST_ADMIN_EMAIL'),
        password: requireEnv('TEST_ADMIN_PASSWORD'),
        name: 'Admin Teste',
        apiRole: 'admin',
      };
  }
}
