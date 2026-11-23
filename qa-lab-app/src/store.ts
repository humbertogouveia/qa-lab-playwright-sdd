import { randomUUID } from 'node:crypto';

export type Role = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  image: string;
}

export interface CartItem {
  productId: number;
  quantity: number;
}

export interface OrderItem {
  productId: number;
  name: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  couponCode: string | null;
  paymentMethod: 'card' | 'pix' | 'boleto';
  address: { fullName: string; cep: string; street: string; number: string; city: string };
  status: 'PAID' | 'PENDING';
  createdAt: string;
}

/** Usuários criados no reset. Documentados no README para uso nos testes. */
export const SEED_USERS: Omit<User, 'id'>[] = [
  { name: 'Cliente Teste', email: 'cliente@qalab.com', password: 'Senha@123', role: 'customer' },
  { name: 'Admin Teste', email: 'admin@qalab.com', password: 'Admin@123', role: 'admin' }
];

const SEED_PRODUCTS: Omit<Product, 'image'>[] = [
  { id: 1, name: 'Teclado Mecânico', category: 'Periféricos', price: 249.9, stock: 15, description: 'Teclado mecânico com switches azuis e layout ABNT2.' },
  { id: 2, name: 'Mouse Sem Fio', category: 'Periféricos', price: 89.9, stock: 40, description: 'Mouse sem fio de 1600 DPI com receptor USB.' },
  { id: 3, name: 'Monitor 24 Polegadas', category: 'Monitores', price: 899.0, stock: 8, description: 'Monitor Full HD de 24 polegadas com painel IPS.' },
  { id: 4, name: 'Monitor 27 Polegadas', category: 'Monitores', price: 1399.0, stock: 5, description: 'Monitor QHD de 27 polegadas, 75 Hz.' },
  { id: 5, name: 'Headset Gamer', category: 'Áudio', price: 199.9, stock: 22, description: 'Headset com microfone removível e som estéreo.' },
  { id: 6, name: 'Caixa de Som Bluetooth', category: 'Áudio', price: 159.0, stock: 30, description: 'Caixa de som portátil à prova d\'água.' },
  { id: 7, name: 'Webcam Full HD', category: 'Periféricos', price: 179.0, stock: 12, description: 'Webcam 1080p com microfone embutido.' },
  { id: 8, name: 'Cadeira Ergonômica', category: 'Móveis', price: 1099.0, stock: 3, description: 'Cadeira com ajuste de altura e apoio lombar.' },
  { id: 9, name: 'Mesa para Home Office', category: 'Móveis', price: 749.0, stock: 6, description: 'Mesa de 120 cm com passagem de cabos.' },
  { id: 10, name: 'Hub USB-C', category: 'Acessórios', price: 129.0, stock: 50, description: 'Hub com HDMI, 3 portas USB e leitor de cartão.' },
  { id: 11, name: 'Cabo HDMI 2 m', category: 'Acessórios', price: 29.9, stock: 120, description: 'Cabo HDMI 2.0 com 2 metros.' },
  { id: 12, name: 'Suporte para Notebook', category: 'Acessórios', price: 99.9, stock: 0, description: 'Suporte de alumínio. Produto sem estoque.' }
];

export const COUPONS: Record<string, number> = {
  QALAB10: 0.1,
  QALAB20: 0.2
};

class Store {
  users: User[] = [];
  products: Product[] = [];
  carts = new Map<string, CartItem[]>();
  orders: Order[] = [];
  sessions = new Map<string, string>(); // token -> userId

  constructor() {
    this.reset();
  }

  reset(): void {
    this.users = SEED_USERS.map((u) => ({ ...u, id: randomUUID() }));
    this.products = SEED_PRODUCTS.map((p) => ({ ...p, image: `/img/products/${p.id}.svg` }));
    this.carts = new Map();
    this.orders = [];
    this.sessions = new Map();
  }

  findUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  cartOf(userId: string): CartItem[] {
    let cart = this.carts.get(userId);
    if (!cart) {
      cart = [];
      this.carts.set(userId, cart);
    }
    return cart;
  }
}

export const store = new Store();
