const tabelaBody = document.getElementById('tabela-gastos');
const filtroCategoria = document.getElementById('filtro-categoria');
const prevBtn = document.getElementById('prev-page');
const nextBtn = document.getElementById('next-page');
const paginaAtualSpan = document.getElementById('pagina-atual');
const totalPaginasSpan = document.getElementById('total-paginas');

let gastos = [];
let gastosFiltrados = [];
let paginaAtual = 1;
const itensPorPagina = 8;

function carregarGastos() {
  // Pega do localStorage (espera-se array de objetos)
  gastos = JSON.parse(localStorage.getItem('despesas') || '[]');
  gastosFiltrados = [...gastos];
  paginaAtual = 1;
  atualizarTabela();
  atualizarPaginacao();
}

function atualizarTabela() {
  tabelaBody.innerHTML = '';

  if(gastosFiltrados.length === 0) {
    tabelaBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhum gasto encontrado.</td></tr>';
    return;
  }

  const start = (paginaAtual - 1) * itensPorPagina;
  const end = start + itensPorPagina;
  const paginaItens = gastosFiltrados.slice(start, end);

  paginaItens.forEach(gasto => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${gasto.descricao || '-'}</td>
      <td>${gasto.observacao || '-'}</td>
      <td>R$ ${gasto.valor.toFixed(2)}</td>
      <td>${gasto.data || '-'}</td>
      <td>${gasto.banco || '-'}</td>
      <td>${gasto.categoria || '-'}</td>
    `;

    tabelaBody.appendChild(tr);
  });
}

function atualizarTabela() {
  tabelaBody.innerHTML = '';

  if (gastosFiltrados.length === 0) {
    tabelaBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Nenhum gasto encontrado.</td></tr>';
    return;
  }

  const start = (paginaAtual - 1) * itensPorPagina;
  const end = start + itensPorPagina;
  const paginaItens = gastosFiltrados.slice(start, end);

  paginaItens.forEach((gasto, index) => {
    const tr = document.createElement('tr');

    const indiceReal = gastos.indexOf(gasto); // Para saber qual item excluir no array original

    tr.innerHTML = `
      <td>${gasto.descricao || '-'}</td>
      <td>${gasto.observacao || '-'}</td>
      <td>R$ ${gasto.valor.toFixed(2)}</td>
      <td>${gasto.data || '-'}</td>
      <td>${gasto.banco || '-'}</td>
      <td>${gasto.categoria || '-'}</td>
      <td>
        <button class="botao-excluir" onclick="excluirDespesa(${indiceReal})">🗑️</button>
      </td>
    `;

    tabelaBody.appendChild(tr);
  });
}


function filtrarGastos() {
  const categoria = filtroCategoria.value;

  if(categoria === 'todas') {
    gastosFiltrados = [...gastos];
  } else {
    gastosFiltrados = gastos.filter(g => g.categoria === categoria);
  }

  paginaAtual = 1;
  atualizarTabela();
  atualizarPaginacao();
}

function paginaAnterior() {
  if(paginaAtual > 1) {
    paginaAtual--;
    atualizarTabela();
    atualizarPaginacao();
  }
}

function proximaPagina() {
  const totalPaginas = Math.ceil(gastosFiltrados.length / itensPorPagina);
  if(paginaAtual < totalPaginas) {
    paginaAtual++;
    atualizarTabela();
    atualizarPaginacao();
  }
}

window.addEventListener('DOMContentLoaded', carregarGastos);

function excluirDespesa(indice) {
  if (confirm("Tem certeza que deseja excluir esta despesa?")) {
    gastos.splice(indice, 1);
    localStorage.setItem("despesas", JSON.stringify(gastos));
    filtrarGastos(); // Refiltra e atualiza a tabela
  }
}

