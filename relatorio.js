function trocarRelatorio() {
  const valor = document.getElementById('tipo-relatorio').value;
  document.querySelectorAll('.report-section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(`relatorio-${valor}`).classList.add('active');
}

window.addEventListener('DOMContentLoaded', () => {
  // Pegar dados do localStorage
  const despesas = JSON.parse(localStorage.getItem('despesas') || '[]');
  const salario = parseFloat(localStorage.getItem('salario') || 0);
  const ganhos = parseFloat(localStorage.getItem('ganhos') || 0);
  const metas = JSON.parse(localStorage.getItem('metas') || '[]'); // espera array {nome, valor}

  // Cálculos gerais
  const totalGastos = despesas.reduce((acc, cur) => acc + cur.valor, 0);
  const totalRenda = salario + ganhos;
  const saldoFinal = totalRenda - totalGastos;

  // Gastos por categoria
  const gastosPorCategoria = {};
  // Gastos por mês (YYYY-MM)
  const gastosPorMes = {};
  // Gastos ao longo do tempo para gráfico de linha
  const gastosLinha = [];
  // Gastos por banco/conta
  const gastosPorBanco = {};
  // Ganhos extras por descrição
  const ganhosExtras = {};
  // Progresso das metas (percentual)
  const progressoMetas = [];

  despesas.forEach(despesa => {
    // Categoria
    if (!gastosPorCategoria[despesa.categoria]) gastosPorCategoria[despesa.categoria] = 0;
    gastosPorCategoria[despesa.categoria] += despesa.valor;

    // Mês
    const mes = despesa.data?.slice(0, 7);
    if (!gastosPorMes[mes]) gastosPorMes[mes] = 0;
    gastosPorMes[mes] += despesa.valor;

    // Linha temporal
    gastosLinha.push({ x: despesa.data, y: despesa.valor });

    // Banco/Conta
    if (!gastosPorBanco[despesa.banco]) gastosPorBanco[despesa.banco] = 0;
    gastosPorBanco[despesa.banco] += despesa.valor;
  });

  // Ganhos extras (pegamos do localStorage, mas espera-se array de objetos {descricao, valor})
  const ganhosArray = JSON.parse(localStorage.getItem('ganhosExtras') || '[]');
  ganhosArray.forEach(g => {
    if (!ganhosExtras[g.descricao]) ganhosExtras[g.descricao] = 0;
    ganhosExtras[g.descricao] += g.valor;
  });

  // Metas - percentual atingido baseado no saldo e valor da meta
  metas.forEach(meta => {
    const perc = totalRenda > 0 ? Math.min((saldoFinal / meta.valor) * 100, 100) : 0;
    progressoMetas.push({ nome: meta.nome, percentual: perc });
  });

  // Categoria mais gasta
  const categoriaMaisGasta = Object.entries(gastosPorCategoria).sort((a, b) => b[1] - a[1])[0] || ["Nenhuma", 0];

  // Média diária
  const dias = new Set(despesas.map(d => d.data)).size || 1;
  const mediaDiaria = totalGastos / dias;

  // Atualiza resumo geral
  document.getElementById('total-ganhos').textContent = `Total Ganhos: R$ ${totalRenda.toFixed(2)}`;
  document.getElementById('total-gasto').textContent = `Total Gasto: R$ ${totalGastos.toFixed(2)}`;
  document.getElementById('categoria-mais-gasta').textContent = `Categoria mais gasta: ${categoriaMaisGasta[0]} (R$ ${categoriaMaisGasta[1].toFixed(2)})`;
  document.getElementById('media-diaria').textContent = `Média de gasto diário: R$ ${mediaDiaria.toFixed(2)}`;
  document.getElementById('saldo-final').textContent = `Saldo final do mês: R$ ${saldoFinal.toFixed(2)}`;
  document.getElementById('previsao-economia').textContent = `Possível economia: R$ ${(saldoFinal > 0 ? saldoFinal * 0.25 : 0).toFixed(2)}`;

  // Mostrar alerta se gasto > 80% da renda
  if (totalGastos > totalRenda * 0.8) {
    document.getElementById('relatorio-alerta').style.display = 'block';
  } else {
    document.getElementById('relatorio-alerta').style.display = 'none';
  }

  // Limpar e criar gráficos
  function criarGraficoPie(ctx, labels, data, title, colors) {
    return new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          label: title,
          data,
          backgroundColor: colors,
          borderColor: '#222',
          borderWidth: 1
        }]
      },
      options: {
        plugins: { legend: { labels: { color: '#eee' } } }
      }
    });
  }

  function criarGraficoBar(ctx, labels, data, label, bgColor) {
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label,
          data,
          backgroundColor: bgColor,
          borderColor: '#111',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: { beginAtZero: true, ticks: { color: '#eee' } },
          x: { ticks: { color: '#eee' } }
        },
        plugins: { legend: { labels: { color: '#eee' } } }
      }
    });
  }

  function criarGraficoLinha(ctx, data) {
    return new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [{
          label: 'Gastos ao Longo do Tempo',
          data: data.sort((a,b) => new Date(a.x) - new Date(b.x)),
          fill: false,
          borderColor: '#ff9800',
          tension: 0.1,
          pointBackgroundColor: '#ff9800',
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        scales: {
          x: {
            type: 'time',
            time: { unit: 'day' },
            title: { display: true, text: 'Data', color: '#eee' },
            ticks: { color: '#eee' }
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Valor (R$)', color: '#eee' },
            ticks: { color: '#eee' }
          }
        },
        plugins: {
          legend: { labels: { color: '#eee' } }
        }
      }
    });
  }

  // Cores padrão
  const cores = ['#f44336','#2196f3','#ffeb3b','#4caf50','#9c27b0','#00bcd4','#ff5722','#795548'];

  // Criar gráficos
  criarGraficoPie(
    document.getElementById('graficoCategorias'),
    Object.keys(gastosPorCategoria),
    Object.values(gastosPorCategoria),
    'Gastos por Categoria',
    cores
  );

  criarGraficoBar(
    document.getElementById('graficoMensal'),
    Object.keys(gastosPorMes),
    Object.values(gastosPorMes),
    'Gastos por Mês',
    '#4caf50'
  );

  criarGraficoLinha(
    document.getElementById('graficoLinha'),
    gastosLinha
  );

  criarGraficoPie(
    document.getElementById('graficoBanco'),
    Object.keys(gastosPorBanco),
    Object.values(gastosPorBanco),
    'Gastos por Banco/Conta',
    cores
  );

  criarGraficoPie(
    document.getElementById('graficoGanhos'),
    Object.keys(ganhosExtras),
    Object.values(ganhosExtras),
    'Ganhos Extras',
    cores
  );

  // Gráfico de barras para metas
  const ctxMeta = document.getElementById('graficoMeta').getContext('2d');
  new Chart(ctxMeta, {
    type: 'bar',
    data: {
      labels: progressoMetas.map(m => m.nome),
      datasets: [{
        label: '% Atingido',
        data: progressoMetas.map(m => m.percentual),
        backgroundColor: '#2196f3',
        borderColor: '#0d47a1',
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      scales: {
        x: {
          max: 100,
          beginAtZero: true,
          ticks: {
            callback: val => val + '%',
            color: '#eee'
          },
          title: { display: true, text: 'Percentual (%)', color: '#eee' }
        },
        y: { ticks: { color: '#eee' } }
      },
      plugins: { legend: { labels: { color: '#eee' } } }
    }
  });

  // Estratégias financeiras
  const estrategias = [];
  if (categoriaMaisGasta[0] === 'Lazer') estrategias.push("Considere reduzir os gastos com lazer este mês.");
  if (saldoFinal < 0) estrategias.push("Evite dívidas. Reveja suas despesas mensais.");
  if (saldoFinal > 0) estrategias.push("Reserve pelo menos 25% do saldo para investimentos ou emergências.");

  const ul = document.getElementById('estrategias-list');
  ul.innerHTML = '';
  estrategias.forEach(e => {
    const li = document.createElement('li');
    li.textContent = e;
    ul.appendChild(li);
  });
});
