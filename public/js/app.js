const state = {
  token: localStorage.getItem("rio_token") || "",
  usuario: JSON.parse(localStorage.getItem("usuario") || "null"),
  pedidoAtual: []
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

function sair() {
  localStorage.removeItem("rio_token");
  localStorage.removeItem("usuario");
  window.location.href = "/login";
}

function authHeaders(extra = {}) {
  return {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + state.token,
    ...extra
  };
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: authHeaders(options.headers || {})
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    sair();
    throw new Error("Sessão expirada");
  }
  if (!res.ok || data.ok === false) throw new Error(data.erro || "Erro");
  return data;
}

function setView(view) {
  $$(".menu-item").forEach(el => el.classList.toggle("active", el.dataset.view === view));
  $$(".view").forEach(el => el.classList.toggle("active", el.id === "view-" + view));
}

function preencherFiltros() {
  const rua = $("#ruaFiltro");
  const andar = $("#andarFiltro");
  rua.innerHTML = "";
  andar.innerHTML = "";
  for (let i = 1; i <= 7; i++) {
    rua.insertAdjacentHTML("beforeend", `<option value="${String(i).padStart(2,"0")}">Rua ${String(i).padStart(2,"0")}</option>`);
    andar.insertAdjacentHTML("beforeend", `<option value="${i}">Andar ${i}</option>`);
  }
  rua.value = "04";
  andar.value = "1";
}

async function carregarStatus() {
  const d = await api("/api/status");
  $("#empresaAtual").textContent = d.usuario.empresa;
  $("#boasVindas").textContent = `${d.usuario.email} • ${d.usuario.tipo}`;
  $("#statusSistema").textContent = "Online";
  $("#dash-user").textContent = d.usuario.email;
  $("#dash-company").textContent = d.usuario.empresa;
  $("#dash-role").textContent = d.usuario.tipo;
  $("#kpi-produtos").textContent = d.kpis.produtos;
  $("#kpi-estoque").textContent = d.kpis.estoque;
  $("#kpi-pedidos").textContent = d.kpis.pedidos;
}

async function carregarProdutos() {
  const d = await api("/api/produtos");
  $("#tbodyProdutos").innerHTML = d.produtos.map(p => `
    <tr>
      <td>${p.codigo}</td>
      <td>${p.descricao || ""}</td>
      <td>${p.fator || 0}</td>
      <td>${p.caixas_por_pallet || 0}</td>
      <td><button onclick="deletarProduto('${p.codigo}')">Excluir</button></td>
    </tr>`).join("") || `<tr><td colspan="5">Sem produtos</td></tr>`;
}

async function salvarProduto() {
  await api("/api/produtos", {
    method: "POST",
    body: JSON.stringify({
      codigo: $("#p_codigo").value.trim(),
      descricao: $("#p_desc").value.trim(),
      fator: Number($("#p_fator").value || 0),
      lastro: Number($("#p_lastro").value || 0),
      camada: Number($("#p_camada").value || 0)
    })
  });
  ["#p_codigo","#p_desc","#p_fator","#p_lastro","#p_camada"].forEach(id => $(id).value = "");
  await carregarProdutos();
  await carregarStatus();
}

async function deletarProduto(codigo) {
  await api("/api/produtos/" + codigo, { method: "DELETE" });
  await carregarProdutos();
  await carregarStatus();
}
window.deletarProduto = deletarProduto;

async function carregarEstoque() {
  const d = await api("/api/estoque");
  $("#tbodyEstoque").innerHTML = d.estoque.map(i => `
    <tr>
      <td>${i.codigo}</td>
      <td>${i.endereco}</td>
      <td>${i.quantidade}</td>
      <td>${i.reservado || 0}</td>
    </tr>`).join("") || `<tr><td colspan="4">Sem registros</td></tr>`;
}

async function adicionarEstoque() {
  await api("/api/estoque/entrada", {
    method: "POST",
    body: JSON.stringify({
      codigo: $("#e_codigo").value.trim(),
      endereco: $("#e_endereco").value.trim(),
      quantidade: Number($("#e_quantidade").value || 0)
    })
  });
  $("#e_codigo").value = "";
  $("#e_endereco").value = "";
  $("#e_quantidade").value = "";
  await carregarEstoque();
  await carregarMapa();
  await carregarStatus();
}

async function carregarMapa() {
  const d = await api("/api/wms/grid");
  const rua = $("#ruaFiltro").value;
  const andar = $("#andarFiltro").value;
  const bloco = d.grid?.[rua]?.[andar] || {};
  $("#gridWms").innerHTML = Object.entries(bloco).map(([pos, item]) => `
    <div class="cell ${item.status}">
      <strong>${rua}-${pos}-${andar}-1</strong><br>
      ${item.produto || item.status}<br>
      Qtd: ${item.quantidade || 0}
    </div>`).join("");
}

function renderPedidoAtual() {
  $("#itensPedido").innerHTML = state.pedidoAtual.map((i, idx) => `<li>${i.codigo} • ${i.quantidade} <button onclick="removerItemPedido(${idx})">Remover</button></li>`).join("");
}
window.removerItemPedido = function(idx) {
  state.pedidoAtual.splice(idx, 1);
  renderPedidoAtual();
};

function adicionarItemPedido() {
  const codigo = $("#pedidoCodigo").value.trim();
  const quantidade = Number($("#pedidoQuantidade").value || 0);
  if (!codigo || !quantidade) return alert("Preencha código e quantidade");
  state.pedidoAtual.push({ codigo, quantidade });
  $("#pedidoCodigo").value = "";
  $("#pedidoQuantidade").value = "";
  renderPedidoAtual();
}

async function salvarPedido() {
  if (!state.pedidoAtual.length) return alert("Adicione itens");
  await api("/api/pedidos", { method: "POST", body: JSON.stringify({ itens: state.pedidoAtual }) });
  state.pedidoAtual = [];
  renderPedidoAtual();
  await carregarPedidos();
  await carregarStatus();
}

async function gerarPicking(id) {
  await api("/api/pedidos/picking/" + id, { method: "POST" });
  await carregarPedidos();
  await carregarEstoque();
  await carregarMapa();
}
window.gerarPicking = gerarPicking;

async function carregarPedidos() {
  const d = await api("/api/pedidos");
  $("#listaPedidos").innerHTML = d.pedidos.map(p => `
    <div style="padding:8px 0;border-bottom:1px solid #1d3c66">
      <strong>Pedido ${p.id}</strong> • ${p.status}<br>
      ${p.itens.map(i => `${i.codigo} (${i.quantidade})${i.falta !== undefined ? " • falta: " + i.falta : ""}`).join(" | ")}<br>
      <button onclick="gerarPicking(${p.id})">Gerar picking</button>
    </div>`).join("") || "Sem pedidos";
}

async function carregarResumoAdmin() {
  try {
    const d = await api("/api/clientes/resumo");
    $("#adminResumo").innerHTML = `Total de clientes: <strong>${d.totalClientes}</strong><br>Receita: <strong>R$ ${d.receita}</strong>`;
  } catch {
    $("#adminResumo").textContent = "Sem permissão";
  }
}

async function carregarEmpresas() {
  try {
    const d = await api("/api/clientes");
    $("#tbodyEmpresas").innerHTML = d.clientes.map(c => `
      <tr><td>${c.nome}</td><td>${c.plano}</td><td>R$ ${c.valor}</td><td>${c.status}</td></tr>`).join("") || `<tr><td colspan="4">Sem empresas</td></tr>`;
  } catch {
    $("#tbodyEmpresas").innerHTML = `<tr><td colspan="4">Sem permissão</td></tr>`;
  }
}

async function criarEmpresa() {
  await api("/api/clientes", {
    method: "POST",
    body: JSON.stringify({
      empresa: $("#empresaNome").value.trim(),
      plano: $("#empresaPlano").value.trim(),
      valor: Number($("#empresaValor").value || 0)
    })
  });
  $("#empresaNome").value = "";
  await carregarResumoAdmin();
  await carregarEmpresas();
}

async function importarArquivo() {
  const input = $("#arquivoImportacao");
  if (!input.files.length) return alert("Selecione um arquivo");
  const form = new FormData();
  form.append("file", input.files[0]);

  const res = await fetch("/api/importar", {
    method: "POST",
    headers: { "Authorization": "Bearer " + state.token },
    body: form
  });
  const data = await res.json();
  $("#saidaImportacao").textContent = JSON.stringify(data, null, 2);
  await carregarEstoque();
  await carregarMapa();
  await carregarStatus();
}

async function testarAdmin() {
  const d = await api("/api/permissoes/admin-only");
  $("#saidaPermissao").textContent = JSON.stringify(d, null, 2);
}

async function carregarLogs() {
  const d = await api("/api/logs");
  $("#listaLogs").innerHTML = d.logs.map(l => `
    <div style="padding:8px 0;border-bottom:1px solid #1d3c66">
      <strong>${l.action}</strong><br>
      ${new Date(l.em).toLocaleString()}<br>
      ${JSON.stringify(l.meta)}
    </div>`).join("") || "Sem logs";
}

async function init() {
  if (!state.token) return sair();
  preencherFiltros();
  await carregarStatus();
  await carregarProdutos();
  await carregarEstoque();
  await carregarMapa();
  await carregarPedidos();
  await carregarResumoAdmin();
  await carregarEmpresas();
  await carregarLogs();

  $$(".menu-item").forEach(btn => btn.addEventListener("click", () => setView(btn.dataset.view)));
  $("#btnLogout").addEventListener("click", sair);
  $("#btnSalvarProduto").addEventListener("click", salvarProduto);
  $("#btnAdicionarEstoque").addEventListener("click", adicionarEstoque);
  $("#btnCarregarMapa").addEventListener("click", carregarMapa);
  $("#btnAddItemPedido").addEventListener("click", adicionarItemPedido);
  $("#btnSalvarPedido").addEventListener("click", salvarPedido);
  $("#btnCriarEmpresa").addEventListener("click", criarEmpresa);
  $("#btnImportar").addEventListener("click", importarArquivo);
  $("#btnTesteAdmin").addEventListener("click", testarAdmin);
}

window.addEventListener("DOMContentLoaded", init);
