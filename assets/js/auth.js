const defaultUser = {
  name: 'Administrador',
  email: 'admin@b7store.com',
  password: 'senha123'
};

function getUsers() {
  const users = JSON.parse(localStorage.getItem('b7store_users') || '[]');
  if (users.length === 0) {
    localStorage.setItem('b7store_users', JSON.stringify([defaultUser]));
    return [defaultUser];
  }
  return users;
}

function saveUsers(users) {
  localStorage.setItem('b7store_users', JSON.stringify(users));
}

function setCurrentUser(user) {
  sessionStorage.setItem('b7store_current_user', JSON.stringify(user));
}

function showMessage(text, type = 'error') {
  const message = document.getElementById('message');
  message.textContent = text;
  message.className = type === 'success' ? 'text-sm text-center text-green-600' : 'text-sm text-center text-red-600';
}

function toggleForm(showRegister) {
  document.getElementById('login-section').classList.toggle('hidden', showRegister);
  document.getElementById('register-section').classList.toggle('hidden', !showRegister);
  document.getElementById('form-title').textContent = showRegister ? 'Crie sua conta' : 'Acesse sua conta';
  document.getElementById('form-subtitle').innerHTML = showRegister
    ? 'Já possui conta? <a href="#" id="btn-login" class="font-medium text-black hover:underline">Faça login</a>'
    : 'Ou <a href="#" id="btn-register" class="font-medium text-black hover:underline">crie uma nova conta gratuitamente</a>';
  showMessage('');
  attachToggleHandlers();
}

function attachToggleHandlers() {
  const registerLink = document.getElementById('btn-register');
  const loginLink = document.getElementById('btn-login');

  if (registerLink) {
    registerLink.onclick = (event) => {
      event.preventDefault();
      toggleForm(true);
    };
  }

  if (loginLink) {
    loginLink.onclick = (event) => {
      event.preventDefault();
      toggleForm(false);
    };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  getUsers();
  attachToggleHandlers();

  document.getElementById('login-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('email-address').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const users = getUsers();
    const user = users.find((item) => item.email.toLowerCase() === email && item.password === password);

    if (!user) {
      showMessage('E-mail ou senha inválidos. Use admin@b7store.com / senha123 ou cadastre-se.');
      return;
    }

    setCurrentUser(user);
    showMessage('Login realizado com sucesso! Redirecionando...', 'success');
    setTimeout(() => {
      window.location.href = 'cadastro-produto.html';
    }, 800);
  });

  document.getElementById('register-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim().toLowerCase();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-password-confirm').value;
    const users = getUsers();

    if (!name || !email || !password) {
      showMessage('Preencha nome, e-mail e senha para se cadastrar.');
      return;
    }

    if (password !== confirmPassword) {
      showMessage('As senhas não coincidem.');
      return;
    }

    if (users.some((item) => item.email === email)) {
      showMessage('E-mail já cadastrado. Faça login ou use outro e-mail.');
      return;
    }

    const newUser = { name, email, password };
    users.push(newUser);
    saveUsers(users);
    showMessage('Conta criada com sucesso! Faça login agora.', 'success');
    toggleForm(false);
  });
});
