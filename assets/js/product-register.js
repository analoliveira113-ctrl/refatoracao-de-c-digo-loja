const API_BASE = window.API_BASE || '';

function getCurrentUser() {
  return JSON.parse(sessionStorage.getItem('b7store_current_user') || 'null');
}

function showProductMessage(text) {
  const message = document.getElementById('product-message');
  if (!message) return;
  message.textContent = text;
  setTimeout(() => {
    message.textContent = '';
  }, 3500);
}

function renderProductsList(products) {
  const productList = document.getElementById('product-list');
  productList.innerHTML = '';
  if (!products || products.length === 0) {
    productList.innerHTML = '<div class="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-600">Nenhum produto cadastrado ainda.</div>';
    return;
  }
  products.reverse().forEach((product) => {
    const card = document.createElement('div');
    card.className = 'rounded-xl border border-gray-200 p-4';
    card.innerHTML = `
      <div class="flex items-start gap-4">
        <div class="h-20 w-20 overflow-hidden rounded-xl bg-gray-100">
          <img src="${product.image || 'assets/images/products/camiseta-css.png'}" alt="${product.name}" class="h-full w-full object-cover" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-3">
            <div>
              <div class="text-base font-semibold text-gray-900">${product.name}</div>
              <div class="text-sm text-gray-500">Categoria: ${product.category}</div>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-500">Estoque: ${product.stock}</div>
              <div class="text-base font-semibold text-gray-900">R$ ${parseFloat(product.price).toFixed(2)}</div>
            </div>
          </div>
          <p class="mt-3 text-sm text-gray-600">${product.description || 'Sem descrição informada.'}</p>
        </div>
      </div>
    `;
    productList.appendChild(card);
  });
}

async function backendRequest(path, options = {}) {
  if (!API_BASE) throw new Error('API_BASE não configurado');
  const url = API_BASE.replace(/\/$/, '') + path;
  const headers = options.headers || {};
  const token = sessionStorage.getItem('b7store_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw err;
  }
  return res.json().catch(() => ({}));
}

document.addEventListener('DOMContentLoaded', async () => {
  const user = getCurrentUser();
  const userInfo = document.getElementById('user-info');
  const form = document.getElementById('product-form');

  if (!user) {
    if (userInfo) userInfo.textContent = 'Usuário não autenticado';
    form.querySelectorAll('input, textarea, button').forEach((field) => (field.disabled = true));
    showProductMessage('Faça login em login.html para acessar o cadastro de produtos.');
    return;
  }

  userInfo.textContent = `Logado como ${user.name || user.email}`;

  // Fetch products from backend when available
  if (API_BASE) {
    try {
      const data = await backendRequest('/products', { method: 'GET' });
      renderProductsList(data || []);
    } catch (err) {
      renderProductsList([]);
    }
  } else {
    // fallback to localStorage
    const products = JSON.parse(localStorage.getItem('b7store_products') || '[]');
    renderProductsList(products);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const product = {
      name: document.getElementById('product-name').value.trim(),
      price: document.getElementById('product-price').value,
      category: document.getElementById('product-category').value.trim(),
      stock: document.getElementById('product-stock').value,
      image: document.getElementById('product-image').value.trim(),
      description: document.getElementById('product-description').value.trim(),
      createdAt: new Date().toISOString(),
    };

    if (!product.name || !product.price || !product.category || !product.stock) {
      showProductMessage('Preencha nome, preço, categoria e estoque.');
      return;
    }

    if (API_BASE) {
      try {
        await backendRequest('/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product),
        });
        // reload list
        const data = await backendRequest('/products', { method: 'GET' });
        renderProductsList(data || []);
        form.reset();
        showProductMessage('Produto cadastrado com sucesso!');
      } catch (err) {
        const msg = (err && err.message) || 'Erro ao cadastrar produto.';
        showProductMessage(msg);
      }
      return;
    }

    // fallback local storage behavior
    const products = JSON.parse(localStorage.getItem('b7store_products') || '[]');
    products.push(product);
    localStorage.setItem('b7store_products', JSON.stringify(products));
    renderProductsList(products);
    form.reset();
    showProductMessage('Produto cadastrado com sucesso!');
  });
});
