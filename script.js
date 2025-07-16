// script.js

// ------------------------
// MENU E NAVEGAÇÃO
// ------------------------
function toggleMenu() {
  document.getElementById('menu-content').classList.toggle('hidden');
}

function showSection(id) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  document.getElementById('menu-content').classList.add('hidden');
}

// ------------------------
// AUTENTICAÇÃO E LOGIN
// ------------------------
function showLogin() {
  document.getElementById('login-modal').classList.remove('hidden');
  document.getElementById('register-modal').classList.add('hidden');
  document.body.style.overflow = 'hidden';
}

function showRegister() {
  document.getElementById('login-modal').classList.add('hidden');
  document.getElementById('register-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function showMainContent() {
  document.getElementById('login-modal').classList.add('hidden');
  document.getElementById('register-modal').classList.add('hidden');
  document.body.style.overflow = 'auto';
}

function getLoggedUser() {
  return JSON.parse(localStorage.getItem('usuarioLogado'));
}

function setLoggedUser(usuario) {
  localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
}

function carregarDadosUsuario(usuario) {
  console.log('Usuário logado:', usuario);
}

window.addEventListener('DOMContentLoaded', () => {
  const usuario = getLoggedUser();
  if (!usuario) {
    showLogin();
  } else {
    showMainContent();
    carregarDadosUsuario(usuario);
  }
});

// Alternar entre login e registro

document.getElementById('show-register').addEventListener('click', e => {
  e.preventDefault();
  showRegister();
});

document.getElementById('show-login').addEventListener('click', e => {
  e.preventDefault();
  showLogin();
});

// LOGIN

document.getElementById('login-form').addEventListener('submit', e => {
  e.preventDefault();

  const usuarioInput = document.getElementById('login-usuario').value.trim();
  const senha = document.getElementById('login-senha').value;
  const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');

  const user = usuarios.find(u => u.usuario === usuarioInput && u.senha === senha);

  if (!user) {
    alert('Usuário ou senha inválidos.');
    return;
  }

  setLoggedUser(user);
  alert('Login realizado com sucesso!');
  showMainContent();
  carregarDadosUsuario(user);
  e.target.reset();
});

// REGISTRO

document.getElementById('register-form').addEventListener('submit', e => {
  e.preventDefault();

  const usuario = document.getElementById('reg-usuario').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const idade = parseInt(document.getElementById('reg-idade').value);
  const senha = document.getElementById('reg-senha').value;

  if (!usuario || !email || !idade || !senha) {
    alert('Preencha todos os campos!');
    return;
  }

  let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');

  if (usuarios.find(u => u.usuario === usuario)) {
    alert('Usuário já existe, escolha outro.');
    return;
  }

  const novoUsuario = { usuario, email, idade, senha };
  usuarios.push(novoUsuario);
  localStorage.setItem('usuarios', JSON.stringify(usuarios));

  alert('Conta criada com sucesso! Faça login.');
  showLogin();
  e.target.reset();
});

// ------------------------
// FUNÇÕES FINANCEIRAS
// ------------------------

function salvarArray(chave, novoItem) {
  let array = JSON.parse(localStorage.getItem(chave) || '[]');
  array.push(novoItem);
  localStorage.setItem(chave, JSON.stringify(array));
}

// Adicionar Despesa

document.getElementById('expense-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const despesa = {
    descricao: document.getElementById('descricao').value.trim(),
    observacao: document.getElementById('observacao').value.trim(),
    valor: parseFloat(document.getElementById('valor').value),
    data: document.getElementById('data').value,
    banco: document.getElementById('banco').value.trim(),
    categoria: document.getElementById('categoria').value,
  };

  salvarArray('despesas', despesa);
  alert('Despesa adicionada com sucesso!');
  this.reset();
});

// Adicionar Salário

document.getElementById('salario-salvar').addEventListener('click', function () {
  const valor = parseFloat(document.getElementById('salario-valor').value);
  if (isNaN(valor) || valor <= 0) {
    alert('Informe um valor válido para o salário.');
    return;
  }
  salvarArray('salarios', { valor });
  alert('Salário adicionado com sucesso!');
  document.getElementById('salario-valor').value = '';
});

// Adicionar Meta

document.getElementById('meta-salvar').addEventListener('click', function () {
  const nome = document.getElementById('meta-nome').value.trim();
  const valor = parseFloat(document.getElementById('meta-valor').value);

  if (!nome) {
    alert('Informe um nome para a meta.');
    return;
  }
  if (isNaN(valor) || valor <= 0) {
    alert('Informe um valor válido para a meta.');
    return;
  }

  salvarArray('metas', { nome, valor });
  alert('Meta adicionada com sucesso!');
  document.getElementById('meta-nome').value = '';
  document.getElementById('meta-valor').value = '';
});

// Adicionar Ganhos Extras

document.getElementById('ganho-salvar').addEventListener('click', function () {
  const descricao = document.getElementById('ganho-descricao').value.trim();
  const valor = parseFloat(document.getElementById('ganho-valor').value);

  if (!descricao) {
    alert('Informe uma descrição para o ganho.');
    return;
  }
  if (isNaN(valor) || valor <= 0) {
    alert('Informe um valor válido para o ganho.');
    return;
  }

  salvarArray('ganhosExtras', { descricao, valor });
  alert('Ganho extra adicionado com sucesso!');
  document.getElementById('ganho-descricao').value = '';
  document.getElementById('ganho-valor').value = '';
});
