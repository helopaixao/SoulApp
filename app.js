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
  financas: [],     // { tipo, descricao, valor, data }
  servicos: [],      // { nome, valor, profissional, descricao }
  agendamentos: []   // { cliente, servico, data, hora }
};

// =========================================================
// FUNÇÕES GERAIS
// =========================================================
function irPara(nomeTela) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const destino = document.getElementById("screen-" + nomeTela);
  if (destino) destino.classList.add("active");
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarDataParaExibir(dataISO) {
  if (!dataISO) return "";
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

function mostrarFeedback(elementoId, mensagem, tipo = "") {
  const elemento = document.getElementById(elementoId);
  if (!elemento) return;

  elemento.textContent = mensagem || "";
  elemento.className = "feedback-msg";
  if (mensagem) elemento.classList.add("show");
  if (tipo === "erro") elemento.classList.add("feedback-msg--error");
  if (tipo === "sucesso") elemento.classList.add("feedback-msg--success");
}

// =========================================================
// NAVEGAÇÃO ENTRE TELAS
// =========================================================
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
// TELA: LOGIN
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
function atualizarResumoFinanca() {
  const totalGastos = dados.financas.reduce((acc, item) => acc + (item.tipo === "gasto" ? item.valor : 0), 0);
  const totalLucro = dados.financas.reduce((acc, item) => acc + (item.tipo === "lucro" ? item.valor : 0), 0);
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
      <span class="item-info">
        <strong>${item.descricao}</strong><br>
        ${item.tipo === "gasto" ? "Gasto" : "Lucro"}: ${formatarMoeda(item.valor)}
      </span>
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
  const tipo = document.getElementById("financa-tipo").value;
  const descricao = document.getElementById("financa-descricao").value.trim();
  const valor = Number(document.getElementById("financa-valor").value);

  if (!descricao) {
    mostrarFeedback("financa-feedback", "Descreva o que foi gasto ou lucrado.", "erro");
    return;
  }

  if (!Number.isFinite(valor) || valor <= 0) {
    mostrarFeedback("financa-feedback", "Informe um valor válido maior que zero.", "erro");
    return;
  }

  const agora = new Date().toLocaleDateString("pt-BR");
  dados.financas.push({ tipo, descricao, valor, data: agora });
  e.target.reset();
  document.getElementById("financa-tipo").value = "lucro";
  renderizarListaFinanca();
  atualizarResumoFinanca();
  renderizarHistoricoFinancas();
  mostrarFeedback("financa-feedback", "Lançamento salvo com sucesso.", "sucesso");
});

// =========================================================
// TELA: SERVIÇOS
// =========================================================
function renderizarDatalistServicos() {
  const datalist = document.getElementById("servicos-cadastrados");
  if (!datalist) return;
  datalist.innerHTML = dados.servicos.map(item => `<option value="${item.nome}"></option>`).join("");
}

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
      renderizarDatalistServicos();
      renderizarListaServico();
      renderizarHistoricoServicos();
    });
  });
}

document.getElementById("form-servico").addEventListener("submit", (e) => {
  e.preventDefault();
  const nome = document.getElementById("servico-nome").value.trim();
  const valor = Number(document.getElementById("servico-valor").value);
  const profissional = document.getElementById("servico-profissional").value.trim();
  const descricao = document.getElementById("servico-descricao").value.trim();

  if (!nome) {
    mostrarFeedback("servico-feedback", "Informe o nome do serviço.", "erro");
    return;
  }

  if (!Number.isFinite(valor) || valor <= 0) {
    mostrarFeedback("servico-feedback", "O valor do serviço precisa ser numérico e maior que zero.", "erro");
    return;
  }

  dados.servicos.push({ nome, valor, profissional, descricao });
  e.target.reset();
  renderizarDatalistServicos();
  renderizarListaServico();
  renderizarHistoricoServicos();
  mostrarFeedback("servico-feedback", "Serviço cadastrado com sucesso.", "sucesso");
});

// =========================================================
// TELA: AGENDAMENTO
// =========================================================
const inputData = document.getElementById("ag-data-input");
const inputHora = document.getElementById("ag-hora-input");

function resetarAgendamentoForm() {
  document.getElementById("form-agendamento").reset();
  document.getElementById("data-label").textContent = "Escolher Data";
  document.getElementById("hora-label").textContent = "Escolher Hora";
  inputData.value = "";
  inputHora.value = "";
}

document.getElementById("btn-escolher-data").addEventListener("click", () => {
  inputData.showPicker ? inputData.showPicker() : inputData.click();
});
document.getElementById("btn-escolher-hora").addEventListener("click", () => {
  inputHora.showPicker ? inputHora.showPicker() : inputHora.click();
});
inputData.addEventListener("change", () => {
  document.getElementById("data-label").textContent = inputData.value ? formatarDataParaExibir(inputData.value) : "Escolher Data";
});
inputHora.addEventListener("change", () => {
  document.getElementById("hora-label").textContent = inputHora.value || "Escolher Hora";
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
  const dataISO = inputData.value;
  const hora = inputHora.value;
  const data = dataISO ? formatarDataParaExibir(dataISO) : "";

  if (!cliente) {
    mostrarFeedback("agendamento-feedback", "Informe o nome do cliente.", "erro");
    return;
  }

  if (dados.servicos.length === 0) {
    mostrarFeedback("agendamento-feedback", "Cadastre pelo menos um serviço antes de agendar.", "erro");
    return;
  }

  const servicoCadastrado = dados.servicos.some(item => item.nome.toLowerCase() === servico.toLowerCase());
  if (!servicoCadastrado) {
    mostrarFeedback("agendamento-feedback", "Este serviço não está cadastrado. Cadastre primeiro.", "erro");
    return;
  }

  if (!dataISO || !hora) {
    mostrarFeedback("agendamento-feedback", "Selecione uma data e uma hora para o agendamento.", "erro");
    return;
  }

  const horarioOcupado = dados.agendamentos.some(item => item.data === data && item.hora === hora);
  if (horarioOcupado) {
    mostrarFeedback("agendamento-feedback", "Este horário já está ocupado para essa data.", "erro");
    return;
  }

  dados.agendamentos.push({ cliente, servico, data, hora });
  resetarAgendamentoForm();
  renderizarListaAgendamento();
  renderizarHistoricoAgendamentos();
  mostrarFeedback("agendamento-feedback", "Agendamento salvo com sucesso.", "sucesso");
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
    <li><span class="item-info">${item.data} — ${item.tipo === "gasto" ? "Gasto" : "Lucro"}: ${item.descricao} (${formatarMoeda(item.valor)})</span></li>
  `).join("")}</ul>`;
}

// Inicializa os resumos e listas
renderizarDatalistServicos();
atualizarResumoFinanca();
renderizarListaFinanca();
renderizarListaServico();
renderizarListaAgendamento();
renderizarHistoricoAgendamentos();
renderizarHistoricoServicos();
renderizarHistoricoFinancas();
