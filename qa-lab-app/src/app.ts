import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { NextFunction, Request, Response } from 'express';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { bugs, resetBugs, setBugs } from './bugs.js';
import { COUPONS, store } from './store.js';
import type { Order, Product, User } from './store.js';

const FREE_SHIPPING_FROM = 500;
const SHIPPING_FEE = 29.9;
const MAX_QTY_PER_ITEM = 10;

const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const isEmail = (v: unknown): v is string => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isNonEmpty = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

interface AuthedRequest extends Request {
  user?: User;
}

function publicUser(u: User) {
  return { id: u.id, name: u.name, email: u.email, role: u.role };
}

function fail(res: Response, status: number, error: string, details?: Record<string, string>) {
  return res.status(status).json(details ? { error, details } : { error });
}

function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.header('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const userId = store.sessions.get(token);
  const user = userId ? store.users.find((u) => u.id === userId) : undefined;
  if (!user) return fail(res, 401, 'Não autenticado');
  req.user = user;
  next();
}

function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') return fail(res, 403, 'Acesso restrito a administradores');
  next();
}

function cartView(userId: string) {
  const items = store.cartOf(userId).flatMap((ci) => {
    const p = store.products.find((x) => x.id === ci.productId);
    if (!p) return [];
    return [
      {
        productId: p.id,
        name: p.name,
        image: p.image,
        unitPrice: p.price,
        quantity: ci.quantity,
        lineTotal: round2(p.price * ci.quantity)
      }
    ];
  });
  const subtotal = round2(items.reduce((sum, i) => sum + i.lineTotal, 0));
  return { items, subtotal };
}

function parseQuantity(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= MAX_QTY_PER_ITEM ? value : null;
}

export function createApp() {
  const app = express();
  app.use(express.json());

  // ---------- Saúde e auxiliares de teste ----------
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/test/reset', (_req, res) => {
    store.reset();
    resetBugs();
    res.json({ status: 'reset' });
  });

  app.get('/api/test/bugs', (_req, res) => {
    res.json(bugs);
  });

  app.post('/api/test/bugs', (req, res) => {
    const unknown = setBugs(req.body ?? {});
    if (unknown.length > 0) return fail(res, 400, `Bugs desconhecidos ou valores inválidos: ${unknown.join(', ')}`);
    res.json(bugs);
  });

  // ---------- Autenticação ----------
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body ?? {};
    const details: Record<string, string> = {};
    if (!isNonEmpty(name)) details.name = 'Nome é obrigatório';
    if (!isEmail(email)) details.email = 'E-mail inválido';
    if (typeof password !== 'string' || password.length < 8) details.password = 'A senha deve ter no mínimo 8 caracteres';
    if (Object.keys(details).length > 0) return fail(res, 400, 'Dados inválidos', details);
    if (store.findUserByEmail(email)) return fail(res, 409, 'E-mail já cadastrado');

    const user: User = { id: randomUUID(), name: name.trim(), email, password, role: 'customer' };
    store.users.push(user);
    const token = randomUUID();
    store.sessions.set(token, user.id);
    res.status(201).json({ token, user: publicUser(user) });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body ?? {};
    if (!isEmail(email) || typeof password !== 'string') return fail(res, 400, 'Informe e-mail e senha');
    const user = store.findUserByEmail(email);
    const passwordOk = user && (bugs.loginAcceptsAnyPassword || user.password === password);
    if (!user || !passwordOk) return fail(res, 401, 'E-mail ou senha inválidos');
    const token = randomUUID();
    store.sessions.set(token, user.id);
    res.json({ token, user: publicUser(user) });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthedRequest, res) => {
    res.json(publicUser(req.user as User));
  });

  app.post('/api/auth/logout', requireAuth, (req, res) => {
    const token = (req.header('authorization') ?? '').slice(7);
    store.sessions.delete(token);
    res.status(204).end();
  });

  // ---------- Catálogo ----------
  app.get('/api/categories', (_req, res) => {
    res.json([...new Set(store.products.map((p) => p.category))].sort());
  });

  app.get('/api/products', async (req, res) => {
    if (bugs.slowCatalog) await sleep(2000);
    const search = String(req.query.search ?? '').trim().toLowerCase();
    const category = String(req.query.category ?? '').trim();
    const page = Math.max(1, Number.parseInt(String(req.query.page ?? '1'), 10) || 1);
    const pageSize = Math.min(50, Math.max(1, Number.parseInt(String(req.query.pageSize ?? '8'), 10) || 8));

    const filtered = store.products.filter(
      (p: Product) =>
        (!search || p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search)) &&
        (!category || p.category === category)
    );
    const total = filtered.length;
    res.json({
      items: filtered.slice((page - 1) * pageSize, page * pageSize),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize))
    });
  });

  app.get('/api/products/:id', (req, res) => {
    const product = store.products.find((p) => p.id === Number(req.params.id));
    if (!product) return fail(res, 404, 'Produto não encontrado');
    res.json(product);
  });

  // ---------- Carrinho ----------
  app.get('/api/cart', requireAuth, (req: AuthedRequest, res) => {
    res.json(cartView((req.user as User).id));
  });

  app.post('/api/cart/items', requireAuth, (req: AuthedRequest, res) => {
    const userId = (req.user as User).id;
    const { productId, quantity } = req.body ?? {};
    const qty = parseQuantity(quantity);
    if (qty === null) return fail(res, 400, `A quantidade deve ser um inteiro entre 1 e ${MAX_QTY_PER_ITEM}`);
    const product = store.products.find((p) => p.id === productId);
    if (!product) return fail(res, 404, 'Produto não encontrado');

    const cart = store.cartOf(userId);
    const existing = cart.find((i) => i.productId === product.id);
    const newQty = (existing?.quantity ?? 0) + qty;
    if (newQty > product.stock) return fail(res, 409, 'Estoque insuficiente');
    if (newQty > MAX_QTY_PER_ITEM) return fail(res, 400, `Máximo de ${MAX_QTY_PER_ITEM} unidades por produto`);
    if (existing) existing.quantity = newQty;
    else cart.push({ productId: product.id, quantity: qty });
    res.status(201).json(cartView(userId));
  });

  app.patch('/api/cart/items/:productId', requireAuth, (req: AuthedRequest, res) => {
    const userId = (req.user as User).id;
    const productId = Number(req.params.productId);
    const qty = parseQuantity(req.body?.quantity);
    if (qty === null) return fail(res, 400, `A quantidade deve ser um inteiro entre 1 e ${MAX_QTY_PER_ITEM}`);
    const item = store.cartOf(userId).find((i) => i.productId === productId);
    if (!item) return fail(res, 404, 'Item não está no carrinho');
    const product = store.products.find((p) => p.id === productId);
    if (!product || qty > product.stock) return fail(res, 409, 'Estoque insuficiente');
    item.quantity = qty;
    res.json(cartView(userId));
  });

  app.delete('/api/cart/items/:productId', requireAuth, (req: AuthedRequest, res) => {
    const userId = (req.user as User).id;
    const productId = Number(req.params.productId);
    const cart = store.cartOf(userId);
    const index = cart.findIndex((i) => i.productId === productId);
    if (index === -1) return fail(res, 404, 'Item não está no carrinho');
    cart.splice(index, 1);
    res.json(cartView(userId));
  });

  app.delete('/api/cart', requireAuth, (req: AuthedRequest, res) => {
    store.carts.set((req.user as User).id, []);
    res.status(204).end();
  });

  // ---------- Pedidos ----------
  app.post('/api/orders', requireAuth, (req: AuthedRequest, res) => {
    const user = req.user as User;
    if (bugs.checkoutServerError) return fail(res, 500, 'Erro interno ao finalizar o pedido');

    const cart = cartView(user.id);
    if (cart.items.length === 0) return fail(res, 400, 'O carrinho está vazio');

    const { address, paymentMethod, couponCode } = req.body ?? {};
    const details: Record<string, string> = {};
    if (!isNonEmpty(address?.fullName)) details.fullName = 'Nome completo é obrigatório';
    const cepOk = bugs.cepValidationBroken ? isNonEmpty(address?.cep) : typeof address?.cep === 'string' && /^\d{5}-?\d{3}$/.test(address.cep);
    if (!cepOk) details.cep = 'CEP inválido. Use o formato 00000-000';
    if (!isNonEmpty(address?.street)) details.street = 'Rua é obrigatória';
    if (!isNonEmpty(address?.number)) details.number = 'Número é obrigatório';
    if (!isNonEmpty(address?.city)) details.city = 'Cidade é obrigatória';
    if (!['card', 'pix', 'boleto'].includes(paymentMethod)) details.paymentMethod = 'Forma de pagamento inválida';

    let couponRate = 0;
    let normalizedCoupon: string | null = null;
    if (isNonEmpty(couponCode)) {
      normalizedCoupon = couponCode.trim().toUpperCase();
      if (!(normalizedCoupon in COUPONS)) details.couponCode = 'Cupom inválido';
      else couponRate = COUPONS[normalizedCoupon];
    }
    if (Object.keys(details).length > 0) return fail(res, 400, 'Dados inválidos', details);

    // Confere estoque novamente no fechamento
    for (const item of cart.items) {
      const product = store.products.find((p) => p.id === item.productId);
      if (!product || item.quantity > product.stock) return fail(res, 409, `Estoque insuficiente para ${item.name}`);
    }

    const subtotal = cart.subtotal;
    const discount = round2(subtotal * couponRate * (bugs.couponAppliedTwice ? 2 : 1));
    const shipping = subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
    const total = round2(subtotal - discount + (bugs.wrongTotal ? 0 : shipping));

    for (const item of cart.items) {
      const product = store.products.find((p) => p.id === item.productId) as Product;
      product.stock -= item.quantity;
    }

    const order: Order = {
      id: randomUUID(),
      userId: user.id,
      items: cart.items.map((i) => ({ productId: i.productId, name: i.name, unitPrice: i.unitPrice, quantity: i.quantity })),
      subtotal,
      shipping,
      discount,
      total,
      couponCode: normalizedCoupon,
      paymentMethod,
      address: {
        fullName: address.fullName.trim(),
        cep: address.cep,
        street: address.street.trim(),
        number: String(address.number).trim(),
        city: address.city.trim()
      },
      status: paymentMethod === 'boleto' ? 'PENDING' : 'PAID',
      createdAt: new Date().toISOString()
    };
    store.orders.push(order);
    store.carts.set(user.id, []);
    res.status(201).json(order);
  });

  app.get('/api/orders', requireAuth, (req: AuthedRequest, res) => {
    const user = req.user as User;
    res.json(store.orders.filter((o) => o.userId === user.id).reverse());
  });

  app.get('/api/orders/:id', requireAuth, (req: AuthedRequest, res) => {
    const user = req.user as User;
    const order = store.orders.find((o) => o.id === req.params.id);
    if (!order) return fail(res, 404, 'Pedido não encontrado');
    if (order.userId !== user.id && user.role !== 'admin') return fail(res, 403, 'Você não tem acesso a este pedido');
    res.json(order);
  });

  app.get('/api/admin/orders', requireAuth, requireAdmin, (_req, res) => {
    res.json([...store.orders].reverse());
  });

  // ---------- Documentação e front ----------
  const openapi = JSON.parse(readFileSync(new URL('../docs/openapi.json', import.meta.url), 'utf-8'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi));
  app.use(express.static(fileURLToPath(new URL('../public', import.meta.url))));

  app.use('/api', (_req, res) => fail(res, 404, 'Rota não encontrada'));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error & { type?: string }, _req: Request, res: Response, _next: NextFunction) => {
    if (err.type === 'entity.parse.failed') return fail(res, 400, 'JSON inválido');
    console.error(err);
    return fail(res, 500, 'Erro interno');
  });

  return app;
}
