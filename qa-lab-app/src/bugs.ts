/**
 * Bugs propositais. Todos começam desligados.
 * Ligue e desligue por POST /api/test/bugs (veja docs/BUGS.md).
 */
export interface Bugs {
  /** POST /api/orders responde 500 em vez de criar o pedido. */
  checkoutServerError: boolean;
  /** O total do pedido ignora o frete. */
  wrongTotal: boolean;
  /** A validação de CEP aceita qualquer texto. */
  cepValidationBroken: boolean;
  /** GET /api/products demora 2 segundos para responder. */
  slowCatalog: boolean;
  /** O cupom é aplicado duas vezes. */
  couponAppliedTwice: boolean;
  /** O login aceita qualquer senha para um e-mail existente. */
  loginAcceptsAnyPassword: boolean;
}

const DEFAULTS: Bugs = {
  checkoutServerError: false,
  wrongTotal: false,
  cepValidationBroken: false,
  slowCatalog: false,
  couponAppliedTwice: false,
  loginAcceptsAnyPassword: false
};

export const bugs: Bugs = { ...DEFAULTS };

export function resetBugs(): void {
  Object.assign(bugs, DEFAULTS);
}

export function setBugs(input: Record<string, unknown>): string[] {
  const unknown: string[] = [];
  for (const [key, value] of Object.entries(input)) {
    if (key in DEFAULTS && typeof value === 'boolean') {
      (bugs as unknown as Record<string, boolean>)[key] = value;
    } else {
      unknown.push(key);
    }
  }
  return unknown;
}

// Permite iniciar o servidor já com bugs ligados: BUGS=wrongTotal,slowCatalog npm start
export function loadBugsFromEnv(env: string | undefined): void {
  if (!env) return;
  const names = env.split(',').map((s) => s.trim()).filter(Boolean);
  setBugs(Object.fromEntries(names.map((n) => [n, true])));
}
