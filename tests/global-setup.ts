import { request, type FullConfig } from '@playwright/test';

/**
 * Roda uma única vez, antes de toda a suíte (e depois do webServer subir o app).
 *
 * Restaura os dados e desliga os bugs do qa-lab-app. O reset NÃO pode ficar em
 * beforeEach: ele apaga todas as sessões do app e, com testes em paralelo,
 * derruba o login de outros testes no meio da execução.
 *
 * Testes que alteram dados (carrinho, pedidos) devem criar o próprio usuário
 * via POST /api/auth/register em vez de depender de reset.
 */
export default async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const api = await request.newContext({ baseURL });

  const response = await api.post('/api/test/reset');
  if (!response.ok()) {
    throw new Error(`Falha ao resetar o app em ${baseURL}: HTTP ${response.status()}`);
  }

  await api.dispose();
}
