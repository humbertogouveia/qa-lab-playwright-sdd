// Front da QA Lab Store: SPA simples com rotas por hash, sem etapa de build.
// Os elementos usam rótulos acessíveis (labels, roles) e data-testid para facilitar a automação.

const $ = (sel) => document.querySelector(sel);
const app = $('#app');
const money = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// ---------- Sessão ----------
const session = {
  get token() {
    try { return sessionStorage.getItem('token'); } catch { return null; }
  },
  get user() {
    try { return JSON.parse(sessionStorage.getItem('user') || 'null'); } catch { return null; }
  },
  save(token, user) {
    try {
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
    } catch { /* storage indisponível */ }
  },
  clear() {
    try { sessionStorage.removeItem('token'); sessionStorage.removeItem('user'); } catch { /* ignore */ }
  }
};

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (session.token) headers.Authorization = `Bearer ${session.token}`;
  const res = await fetch(`/api${path}`, { ...options, headers });
  const body = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(body?.error || 'Erro inesperado');
    err.status = res.status;
    err.details = body?.details || {};
    throw err;
  }
  return body;
}

function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2500);
}

function renderNav() {
  const user = session.user;
  $('#nav-login').hidden = !!user;
  $('#nav-register').hidden = !!user;
  $('#nav-orders').hidden = !user;
  $('#logout').hidden = !user;
  const name = $('#user-name');
  name.hidden = !user;
  name.textContent = user ? `Olá, ${user.name}` : '';
}

async function refreshCartCount() {
  const el = $('#cart-count');
  if (!session.token) { el.textContent = '0'; return; }
  try {
    const cart = await api('/cart');
    el.textContent = String(cart.items.reduce((n, i) => n + i.quantity, 0));
  } catch { el.textContent = '0'; }
}

function go(hash) { location.hash = hash; }

function fieldError(details, name) {
  return `<div class="field-error" id="err-${name}" data-testid="error-${name}">${details[name] ? esc(details[name]) : ''}</div>`;
}

function input({ id, label, type = 'text', value = '', details = {}, autocomplete = 'off', extra = '' }) {
  const invalid = details[id] ? 'aria-invalid="true"' : '';
  return `
    <div class="field">
      <label for="${id}">${label}</label>
      <input id="${id}" name="${id}" type="${type}" value="${esc(value)}" autocomplete="${autocomplete}" ${invalid} aria-describedby="err-${id}" ${extra} />
      ${fieldError(details, id)}
    </div>`;
}

// ---------- Páginas ----------
async function catalogPage(params) {
  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const page = Number(params.get('page') || '1');
  app.innerHTML = '<h1>Catálogo</h1><p>Carregando…</p>';
  const [categories, result] = await Promise.all([
    api('/categories'),
    api(`/products?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}&page=${page}`)
  ]);

  app.innerHTML = `
    <h1>Catálogo</h1>
    <form class="filters" id="filters" role="search">
      <div class="field">
        <label for="search">Buscar produto</label>
        <input id="search" type="search" value="${esc(search)}" />
      </div>
      <div class="field">
        <label for="category">Categoria</label>
        <select id="category">
          <option value="">Todas</option>
          ${categories.map((c) => `<option value="${esc(c)}" ${c === category ? 'selected' : ''}>${esc(c)}</option>`).join('')}
        </select>
      </div>
      <div class="field"><button type="submit">Buscar</button></div>
    </form>
    <p class="muted" data-testid="results-count">${result.total} produto(s) encontrado(s)</p>
    ${result.items.length === 0 ? '<p data-testid="empty-state">Nenhum produto encontrado.</p>' : ''}
    <section class="grid" aria-label="Lista de produtos">
      ${result.items.map((p) => `
        <article class="card" data-testid="product-card" data-product-id="${p.id}">
          <img class="thumb" src="${esc(p.image)}" alt="Imagem de ${esc(p.name)}" width="200" height="150" loading="lazy" data-testid="product-image" />
          <h2 data-testid="product-name">${esc(p.name)}</h2>
          <span class="badge">${esc(p.category)}</span>
          <p class="muted">${esc(p.description)}</p>
          <span class="price" data-testid="product-price">${money(p.price)}</span>
          ${p.stock === 0 ? '<span class="badge out" data-testid="out-of-stock">Sem estoque</span>' : `<span class="muted">${p.stock} em estoque</span>`}
          <button type="button" data-add="${p.id}" ${p.stock === 0 ? 'disabled' : ''} aria-label="Adicionar ${esc(p.name)} ao carrinho">Adicionar ao carrinho</button>
        </article>`).join('')}
    </section>
    <nav class="pager" aria-label="Paginação">
      <button type="button" class="secondary" id="prev" ${page <= 1 ? 'disabled' : ''}>Anterior</button>
      <span data-testid="page-info">Página ${result.page} de ${result.totalPages}</span>
      <button type="button" class="secondary" id="next" ${page >= result.totalPages ? 'disabled' : ''}>Próxima</button>
    </nav>`;

  const nav = (p) => go(`#/?search=${encodeURIComponent($('#search').value)}&category=${encodeURIComponent($('#category').value)}&page=${p}`);
  $('#filters').addEventListener('submit', (e) => { e.preventDefault(); nav(1); });
  $('#prev').addEventListener('click', () => nav(page - 1));
  $('#next').addEventListener('click', () => nav(page + 1));

  app.querySelectorAll('[data-add]').forEach((btn) =>
    btn.addEventListener('click', async () => {
      if (!session.token) { go('#/login?reason=cart'); return; }
      try {
        await api('/cart/items', { method: 'POST', body: JSON.stringify({ productId: Number(btn.dataset.add), quantity: 1 }) });
        toast('Produto adicionado ao carrinho');
        refreshCartCount();
      } catch (err) { toast(err.message); }
    })
  );
}

function loginPage(params) {
  const notice = params.get('reason') === 'cart' ? 'Entre para adicionar produtos ao carrinho.' : params.get('reason') === 'auth' ? 'Entre para continuar.' : '';
  app.innerHTML = `
    <h1>Entrar</h1>
    <form class="panel" id="login-form" novalidate>
      ${notice ? `<div class="alert" data-testid="login-notice">${notice}</div>` : ''}
      <div id="form-error" role="alert" data-testid="form-error"></div>
      ${input({ id: 'email', label: 'E-mail', type: 'email', autocomplete: 'username' })}
      ${input({ id: 'password', label: 'Senha', type: 'password', autocomplete: 'current-password' })}
      <button type="submit">Entrar</button>
    </form>`;
  $('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const { token, user } = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email: $('#email').value.trim(), password: $('#password').value }) });
      session.save(token, user);
      renderNav();
      await refreshCartCount();
      go('#/');
    } catch (err) {
      $('#form-error').innerHTML = `<div class="alert error">${esc(err.message)}</div>`;
    }
  });
}

function registerPage() {
  const render = (details = {}, values = {}, message = '') => {
    app.innerHTML = `
      <h1>Criar conta</h1>
      <form class="panel" id="register-form" novalidate>
        <div id="form-error" role="alert" data-testid="form-error">${message ? `<div class="alert error">${esc(message)}</div>` : ''}</div>
        ${input({ id: 'name', label: 'Nome', value: values.name || '', details, autocomplete: 'name' })}
        ${input({ id: 'email', label: 'E-mail', type: 'email', value: values.email || '', details, autocomplete: 'email' })}
        ${input({ id: 'password', label: 'Senha', type: 'password', details, autocomplete: 'new-password' })}
        <button type="submit">Criar conta</button>
      </form>`;
    $('#register-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = { name: $('#name').value, email: $('#email').value.trim(), password: $('#password').value };
      try {
        const { token, user } = await api('/auth/register', { method: 'POST', body: JSON.stringify(data) });
        session.save(token, user);
        renderNav();
        go('#/');
      } catch (err) {
        render(err.details, data, Object.keys(err.details).length ? '' : err.message);
      }
    });
  };
  render();
}

async function cartPage() {
  if (!session.token) return go('#/login?reason=auth');
  const cart = await api('/cart');
  app.innerHTML = `
    <h1>Carrinho</h1>
    ${cart.items.length === 0 ? '<p data-testid="empty-cart">Seu carrinho está vazio.</p><a href="#/">Ver produtos</a>' : `
    <table>
      <thead><tr><th>Produto</th><th>Preço</th><th>Quantidade</th><th>Total</th><th><span class="sr-only">Ações</span></th></tr></thead>
      <tbody>
        ${cart.items.map((i) => `
          <tr data-testid="cart-row" data-product-id="${i.productId}">
            <td><div class="cart-product"><img class="cart-thumb" src="${esc(i.image)}" alt="" width="60" height="45" /><span data-testid="cart-name">${esc(i.name)}</span></div></td>
            <td>${money(i.unitPrice)}</td>
            <td><input type="number" min="1" max="10" value="${i.quantity}" data-qty="${i.productId}" aria-label="Quantidade de ${esc(i.name)}" /></td>
            <td data-testid="cart-line-total">${money(i.lineTotal)}</td>
            <td><button type="button" class="danger" data-remove="${i.productId}" aria-label="Remover ${esc(i.name)}">Remover</button></td>
          </tr>`).join('')}
      </tbody>
    </table>
    <div class="summary">
      <div class="total"><span>Subtotal</span><span data-testid="cart-subtotal">${money(cart.subtotal)}</span></div>
      <p class="muted">Frete grátis em compras a partir de R$ 500,00.</p>
      <button type="button" id="checkout">Finalizar compra</button>
    </div>`}`;

  app.querySelectorAll('[data-qty]').forEach((el) =>
    el.addEventListener('change', async () => {
      try {
        await api(`/cart/items/${el.dataset.qty}`, { method: 'PATCH', body: JSON.stringify({ quantity: Number(el.value) }) });
      } catch (err) { toast(err.message); }
      await cartPage();
      refreshCartCount();
    })
  );
  app.querySelectorAll('[data-remove]').forEach((el) =>
    el.addEventListener('click', async () => {
      await api(`/cart/items/${el.dataset.remove}`, { method: 'DELETE' });
      await cartPage();
      refreshCartCount();
    })
  );
  $('#checkout')?.addEventListener('click', () => go('#/checkout'));
}

async function checkoutPage() {
  if (!session.token) return go('#/login?reason=auth');
  const cart = await api('/cart');
  if (cart.items.length === 0) return go('#/cart');

  const render = (details = {}, values = {}, message = '') => {
    app.innerHTML = `
      <h1>Finalizar compra</h1>
      <p data-testid="checkout-subtotal">Subtotal: ${money(cart.subtotal)}</p>
      <form class="panel wide" id="checkout-form" novalidate>
        <div id="form-error" role="alert" data-testid="form-error">${message ? `<div class="alert error">${esc(message)}</div>` : ''}</div>
        ${input({ id: 'fullName', label: 'Nome completo', value: values.fullName || '', details, autocomplete: 'name' })}
        ${input({ id: 'cep', label: 'CEP', value: values.cep || '', details, autocomplete: 'postal-code', extra: 'placeholder="00000-000"' })}
        ${input({ id: 'street', label: 'Rua', value: values.street || '', details, autocomplete: 'address-line1' })}
        ${input({ id: 'number', label: 'Número', value: values.number || '', details })}
        ${input({ id: 'city', label: 'Cidade', value: values.city || '', details, autocomplete: 'address-level2' })}
        <div class="field">
          <label for="paymentMethod">Forma de pagamento</label>
          <select id="paymentMethod" name="paymentMethod">
            <option value="card" ${values.paymentMethod === 'card' ? 'selected' : ''}>Cartão</option>
            <option value="pix" ${values.paymentMethod === 'pix' ? 'selected' : ''}>Pix</option>
            <option value="boleto" ${values.paymentMethod === 'boleto' ? 'selected' : ''}>Boleto</option>
          </select>
          ${fieldError(details, 'paymentMethod')}
        </div>
        ${input({ id: 'couponCode', label: 'Cupom de desconto (opcional)', value: values.couponCode || '', details })}
        <button type="submit">Confirmar pedido</button>
      </form>`;
    $('#checkout-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const v = {
        fullName: $('#fullName').value, cep: $('#cep').value.trim(), street: $('#street').value,
        number: $('#number').value, city: $('#city').value, paymentMethod: $('#paymentMethod').value,
        couponCode: $('#couponCode').value.trim()
      };
      try {
        const order = await api('/orders', {
          method: 'POST',
          body: JSON.stringify({
            address: { fullName: v.fullName, cep: v.cep, street: v.street, number: v.number, city: v.city },
            paymentMethod: v.paymentMethod,
            couponCode: v.couponCode || undefined
          })
        });
        await refreshCartCount();
        go(`#/orders/${order.id}?new=1`);
      } catch (err) {
        render(err.details, v, Object.keys(err.details).length ? '' : err.message);
      }
    });
  };
  render();
}

const paymentLabel = { card: 'Cartão', pix: 'Pix', boleto: 'Boleto' };
const statusLabel = { PAID: 'Pago', PENDING: 'Aguardando pagamento' };

async function orderPage(id, params) {
  if (!session.token) return go('#/login?reason=auth');
  let order;
  try { order = await api(`/orders/${id}`); } catch (err) {
    app.innerHTML = `<h1>Pedido</h1><div class="alert error" role="alert" data-testid="order-error">${esc(err.message)}</div>`;
    return;
  }
  app.innerHTML = `
    <h1 data-testid="order-title">${params.get('new') ? 'Pedido confirmado' : 'Detalhes do pedido'}</h1>
    <div class="card" data-testid="order-detail">
      <p>Número do pedido: <strong data-testid="order-id">${esc(order.id)}</strong></p>
      <p>Status: <span class="badge" data-testid="order-status">${statusLabel[order.status]}</span></p>
      <p>Pagamento: ${paymentLabel[order.paymentMethod]}</p>
      <p>Entrega: ${esc(order.address.fullName)}, ${esc(order.address.street)}, ${esc(order.address.number)} - ${esc(order.address.city)} (${esc(order.address.cep)})</p>
      <ul>${order.items.map((i) => `<li>${i.quantity} × ${esc(i.name)} — ${money(i.unitPrice * i.quantity)}</li>`).join('')}</ul>
      <div class="summary">
        <div><span>Subtotal</span><span data-testid="order-subtotal">${money(order.subtotal)}</span></div>
        <div><span>Desconto${order.couponCode ? ` (${esc(order.couponCode)})` : ''}</span><span data-testid="order-discount">${money(order.discount)}</span></div>
        <div><span>Frete</span><span data-testid="order-shipping">${money(order.shipping)}</span></div>
        <div class="total"><span>Total</span><span data-testid="order-total">${money(order.total)}</span></div>
      </div>
    </div>
    <p><a href="#/orders">Ver todos os pedidos</a></p>`;
}

async function ordersPage() {
  if (!session.token) return go('#/login?reason=auth');
  const orders = await api('/orders');
  app.innerHTML = `
    <h1>Meus pedidos</h1>
    ${orders.length === 0 ? '<p data-testid="empty-orders">Você ainda não fez pedidos.</p>' : `
    <table>
      <thead><tr><th>Pedido</th><th>Data</th><th>Status</th><th>Total</th></tr></thead>
      <tbody>
        ${orders.map((o) => `
          <tr data-testid="order-row">
            <td><a href="#/orders/${o.id}">${esc(o.id.slice(0, 8))}</a></td>
            <td>${new Date(o.createdAt).toLocaleString('pt-BR')}</td>
            <td>${statusLabel[o.status]}</td>
            <td>${money(o.total)}</td>
          </tr>`).join('')}
      </tbody>
    </table>`}`;
}

// ---------- Rotas ----------
async function route() {
  const [path, query = ''] = (location.hash.slice(1) || '/').split('?');
  const params = new URLSearchParams(query);
  renderNav();
  try {
    if (path === '/' ) await catalogPage(params);
    else if (path === '/login') loginPage(params);
    else if (path === '/register') registerPage();
    else if (path === '/cart') await cartPage();
    else if (path === '/checkout') await checkoutPage();
    else if (path === '/orders') await ordersPage();
    else if (path.startsWith('/orders/')) await orderPage(path.split('/')[2], params);
    else app.innerHTML = '<h1>Página não encontrada</h1><a href="#/">Voltar ao catálogo</a>';
  } catch (err) {
    if (err.status === 401) { session.clear(); renderNav(); go('#/login?reason=auth'); return; }
    app.innerHTML = `<div class="alert error" role="alert" data-testid="page-error">${esc(err.message)}</div>`;
  }
  refreshCartCount();
}

$('#logout').addEventListener('click', async () => {
  try { await api('/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
  session.clear();
  renderNav();
  $('#cart-count').textContent = '0';
  go('#/');
});

window.addEventListener('hashchange', route);
route();
