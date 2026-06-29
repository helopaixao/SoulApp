/* =========================================================
   SOUL — app.js
   Protótipo de apresentação:
   - Login fixo (email/senha hardcoded, como no MIT App Inventor)
   - Navegação entre telas (equivalente a "abrir outra tela")
   - Dados guardados em memória (arrays), zerando ao recarregar a página
     -> igual ao combinado: sem localStorage, sem banco de dados.
========================================================= */

// ---------- Credenciais fixas (mesmas do bloco "CasoErro" do App Inventor) ----------
const EMAIL_VALIDO = "cadastroempresa@gmail.com";
const SENHA_VALIDA = "Empresa23";

// ---------- "Bancos" de dados em memória (somem ao recarregar a página) ----------
const dados = {
  financas: [],     // { gasto, lucro, data }
  servicos: [],      // { nome, valor, profissional, descricao }
  agendamentos: []   // { cliente, servico, data, hora }
};

// =========================================================
// NAVEGAÇÃO ENTRE TELAS
// =========================================================
function irPara(nomeTela) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const destino = document.getElementById("screen-" + nomeTela);
  if (destino) destino.classList.add("active");
}

// Botões "menu-item" (Escolha a Função -> Financa / Servico / Agendamento / Historico)
document.querySelectorAll(".menu-item").forEach(btn => {
  btn.addEventListener("click", () => irPara(btn.dataset.goto));
});

// Botões "Voltar"
document.querySelectorAll(".btn-voltar").forEach(btn => {
  btn.addEventListener("click", () => irPara(btn.dataset.back));
});

// Botão de logout na tela "Escolher Função" -> volta pro Login
document.getElementById("btn-logout").addEventListener("click", () => {
  document.getElementById("form-login").reset();
  document.getElementById("login-erro").classList.remove("show");
  irPara("login");
});

// =========================================================
// TELA: LOGIN (equivalente ao bloco entrar_botao.Click)
// =========================================================
document.getElementById("form-login").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const senha = document.getElementById("login-senha").value.trim();
  const erroEl = document.getElementById("login-erro");

  if (email === EMAIL_VALIDO && senha === SENHA_VALIDA) {
    erroEl.classList.remove("show");
    irPara("funcao");
  } else {
    erroEl.classList.add("show");
  }
});

// =========================================================
// TELA: FINANÇAS
// =========================================================
function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function atualizarResumoFinanca() {
  const totalGastos = dados.financas.reduce((acc, item) => acc + item.gasto, 0);
  const totalLucro = dados.financas.reduce((acc, item) => acc + item.lucro, 0);
  document.getElementById("resumo-gastos").textContent = formatarMoeda(totalGastos);
  document.getElementById("resumo-lucro").textContent = formatarMoeda(totalLucro);
  document.getElementById("resumo-saldo").textContent = formatarMoeda(totalLucro - totalGastos);
}

function renderizarListaFinanca() {
  const lista = document.getElementById("financa-lista");
  lista.innerHTML = "";
  dados.financas.forEach((item, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="item-info">${item.data} — Gasto: ${formatarMoeda(item.gasto)} | Lucro: ${formatarMoeda(item.lucro)}</span>
      <button class="item-del" data-index="${index}" title="Excluir">✕</button>
    `;
    lista.appendChild(li);
  });
  lista.querySelectorAll(".item-del").forEach(btn => {
    btn.addEventListener("click", () => {
      dados.financas.splice(Number(btn.dataset.index), 1);
      renderizarListaFinanca();
      atualizarResumoFinanca();
      renderizarHistoricoFinancas();
    });
  });
}

document.getElementById("form-financa").addEventListener("submit", (e) => {
  e.preventDefault();
  const gasto = parseFloat(document.getElementById("financa-gastos").value) || 0;
  const lucro = parseFloat(document.getElementById("financa-lucro").value) || 0;
  const agora = new Date().toLocaleDateString("pt-BR");

  dados.financas.push({ gasto, lucro, data: agora });
  e.target.reset();
  renderizarListaFinanca();
  atualizarResumoFinanca();
  renderizarHistoricoFinancas();
});

// =========================================================
// TELA: SERVIÇOS
// =========================================================
function renderizarListaServico() {
  const lista = document.getElementById("servico-lista");
  lista.innerHTML = "";
  dados.servicos.forEach((item, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="item-info"><strong>${item.nome}</strong> — ${formatarMoeda(item.valor)}${item.profissional ? " · " + item.profissional : ""}</span>
      <button class="item-del" data-index="${index}" title="Excluir">✕</button>
    `;
    lista.appendChild(li);
  });
  lista.querySelectorAll(".item-del").forEach(btn => {
    btn.addEventListener("click", () => {
      dados.servicos.splice(Number(btn.dataset.index), 1);
      renderizarListaServico();
      renderizarHistoricoServicos();
    });
  });
}

document.getElementById("form-servico").addEventListener("submit", (e) => {
  e.preventDefault();
  const nome = document.getElementById("servico-nome").value.trim();
  const valor = parseFloat(document.getElementById("servico-valor").value) || 0;
  const profissional = document.getElementById("servico-profissional").value.trim();
  const descricao = document.getElementById("servico-descricao").value.trim();

  dados.servicos.push({ nome, valor, profissional, descricao });
  e.target.reset();
  renderizarListaServico();
  renderizarHistoricoServicos();
});

// =========================================================
// TELA: AGENDAMENTO
// =========================================================
const inputData = document.getElementById("ag-data-input");
const inputHora = document.getElementById("ag-hora-input");

document.getElementById("btn-escolher-data").addEventListener("click", () => {
  inputData.showPicker ? inputData.showPicker() : inputData.click();
});
document.getElementById("btn-escolher-hora").addEventListener("click", () => {
  inputHora.showPicker ? inputHora.showPicker() : inputHora.click();
});
inputData.addEventListener("change", () => {
  const [ano, mes, dia] = inputData.value.split("-");
  document.getElementById("data-label").textContent = `${dia}/${mes}/${ano}`;
});
inputHora.addEventListener("change", () => {
  document.getElementById("hora-label").textContent = inputHora.value;
});

function renderizarListaAgendamento() {
  const lista = document.getElementById("agendamento-lista");
  lista.innerHTML = "";
  dados.agendamentos.forEach((item, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="item-info"><strong>${item.cliente}</strong> — ${item.servico}<br>${item.data || "data não definida"} ${item.hora || ""}</span>
      <button class="item-del" data-index="${index}" title="Excluir">✕</button>
    `;
    lista.appendChild(li);
  });
  lista.querySelectorAll(".item-del").forEach(btn => {
    btn.addEventListener("click", () => {
      dados.agendamentos.splice(Number(btn.dataset.index), 1);
      renderizarListaAgendamento();
      renderizarHistoricoAgendamentos();
    });
  });
}

document.getElementById("form-agendamento").addEventListener("submit", (e) => {
  e.preventDefault();
  const cliente = document.getElementById("ag-nome").value.trim();
  const servico = document.getElementById("ag-servico").value.trim();
  const data = document.getElementById("data-label").textContent === "Escolher Data" ? "" : document.getElementById("data-label").textContent;
  const hora = document.getElementById("hora-label").textContent === "Escolher Hora" ? "" : document.getElementById("hora-label").textContent;

  dados.agendamentos.push({ cliente, servico, data, hora });
  e.target.reset();
  document.getElementById("data-label").textContent = "Escolher Data";
  document.getElementById("hora-label").textContent = "Escolher Hora";
  renderizarListaAgendamento();
  renderizarHistoricoAgendamentos();
});

// =========================================================
// TELA: HISTÓRICO (abas)
// =========================================================
document.querySelectorAll(".tab-btn").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    document.querySelectorAll(".historico-painel").forEach(p => p.style.display = "none");
    document.getElementById("hist-" + tab.dataset.tab).style.display = "block";
  });
});

function renderizarHistoricoAgendamentos() {
  const painel = document.getElementById("hist-agendamentos");
  if (dados.agendamentos.length === 0) {
    painel.innerHTML = `<p class="empty-msg">Nenhum agendamento registrado ainda.</p>`;
    return;
  }
  painel.innerHTML = `<ul class="lista-itens">${dados.agendamentos.map(item => `
    <li><span class="item-info"><strong>${item.cliente}</strong> — ${item.servico} (${item.data || "sem data"} ${item.hora || ""})</span></li>
  `).join("")}</ul>`;
}

function renderizarHistoricoServicos() {
  const painel = document.getElementById("hist-servicos");
  if (dados.servicos.length === 0) {
    painel.innerHTML = `<p class="empty-msg">Nenhum serviço cadastrado ainda.</p>`;
    return;
  }
  painel.innerHTML = `<ul class="lista-itens">${dados.servicos.map(item => `
    <li><span class="item-info"><strong>${item.nome}</strong> — ${formatarMoeda(item.valor)}</span></li>
  `).join("")}</ul>`;
}

function renderizarHistoricoFinancas() {
  const painel = document.getElementById("hist-financas");
  if (dados.financas.length === 0) {
    painel.innerHTML = `<p class="empty-msg">Nenhum lançamento financeiro ainda.</p>`;
    return;
  }
  painel.innerHTML = `<ul class="lista-itens">${dados.financas.map(item => `
    <li><span class="item-info">${item.data} — Gasto: ${formatarMoeda(item.gasto)} | Lucro: ${formatarMoeda(item.lucro)}</span></li>
  `).join("")}</ul>`;
}

// Inicializa os resumos vazios
atualizarResumoFinanca();
