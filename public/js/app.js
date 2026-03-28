const state = {
  token: localStorage.getItem("rio_token") || "",
  usuario: JSON.parse(localStorage.getItem("usuario") || "null"),
};

function api(path, options = {}) {
  return fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + state.token
    }
  }).then(r => r.json());
}

function show(view) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.getElementById("view-" + view).classList.add("active");

  if (view === "dashboard") loadDashboard();
  if (view === "estoque") loadEstoque();
  if (view === "produtos") loadProdutos();
  if (view === "wms") loadWMS();
  if (view === "pickings") loadPedidos();
  if (view === "admin") loadAdmin();
  if (view === "dev") loadLogs();
}

async function loadDashboard() {
  const d = await api("/api/status");
  document.getElementById("dash-user").innerText = d.usuario.email;
  document.getElementById("dash-company").innerText = d.usuario.empresa;
  document.getElementById("dash-role").innerText = d.usuario.tipo;
  document.getElementById("kpi-produtos").innerText = d.kpis.produtos;
  document.getElementById("kpi-estoque").innerText = d.kpis.estoque;
  document.getElementById("kpi-pedidos").innerText = d.kpis.pedidos;
}

async function loadProdutos() {
  const d = await api("/api/produtos");
  document.getElementById("tbodyProdutos").innerHTML =
    d.produtos.map(p => `
      <tr>
        <td>${p.codigo}</td>
        <td>${p.descricao || ""}</td>
        <td>${p.fator || 0}</td>
        <td>${p.caixas_por_pallet || 0}</td>
      </tr>
    `).join("");
}

async function loadEstoque() {
  const d = await api("/api/estoque");
  document.getElementById("tbodyEstoque").innerHTML =
    d.estoque.map(e => `
      <tr>
        <td>${e.codigo}</td>
        <td>${e.endereco}</td>
        <td>${e.quantidade}</td>
      </tr>
    `).join("");
}

async function loadPedidos() {
  const d = await api("/api/pedidos");
  document.getElementById("listaPedidos").innerHTML =
    d.pedidos.map(p => `
      <div>
        Pedido ${p.id} - ${p.status}
      </div>
    `).join("");
}

async function loadWMS() {
  const d = await api("/api/wms/grid");
  document.getElementById("gridWms").innerHTML =
    Object.entries(d.grid["04"]["1"]).map(([pos, item]) => `
      <div class="cell ${item.status}">
        ${item.produto || item.status}
      </div>
    `).join("");
}

async function loadAdmin() {
  const d = await api("/api/clientes");
  document.getElementById("tbodyEmpresas").innerHTML =
    d.clientes.map(c => `
      <tr>
        <td>${c.nome}</td>
        <td>${c.plano}</td>
        <td>${c.valor}</td>
      </tr>
    `).join("");
}

async function loadLogs() {
  const d = await api("/api/logs");
  document.getElementById("listaLogs").innerHTML =
    d.logs.map(l => `<div>${l.action}</div>`).join("");
}

document.querySelectorAll(".menu-item").forEach(btn => {
  btn.addEventListener("click", () => show(btn.dataset.view));
});

window.onload = () => {
  show("dashboard");
};
