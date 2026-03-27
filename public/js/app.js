async function testarStatus() {
  const res = await fetch("/api/status");
  const data = await res.json();
  document.getElementById("status").innerText = data.sistema + " - " + data.status;
}

async function adicionar() {
  await fetch("/api/estoque/entrada", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      codigo: document.getElementById("codigo").value,
      endereco: document.getElementById("endereco").value,
      quantidade: document.getElementById("qtd").value
    })
  });

  listar();
  carregarWms();
}

async function importar() {
  const file = document.getElementById("file").files[0];
  if (!file) return;

  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch("/api/importar", {
    method: "POST",
    body: fd
  });

  const data = await res.json();
  document.getElementById("importacao").innerText = data.ok
    ? ("Importado: " + data.importados + " / Preview: " + data.totalLinhas + " linhas")
    : data.erro;

  listar();
  carregarWms();
}

async function listar() {
  const res = await fetch("/api/estoque");
  const data = await res.json();

  const el = document.getElementById("estoque");
  el.innerHTML = "";

  (data.estoque || []).forEach((i) => {
    const div = document.createElement("div");
    div.innerText = i.codigo + " | " + i.endereco + " | qtd: " + i.quantidade + " | reservado: " + i.reservado;
    el.appendChild(div);
  });
}

async function criarPedido() {
  const codigo = document.getElementById("pedidoCodigo").value;
  const quantidade = Number(document.getElementById("pedidoQtd").value || 0);

  const res = await fetch("/api/pedido", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      itens: [{ codigo, quantidade }]
    })
  });

  const data = await res.json();
  if (data.ok) {
    document.getElementById("pedidos").innerText = "Pedido criado: " + data.pedido.id;
  }
}

async function carregarWms() {
  const res = await fetch("/api/wms/grid");
  const data = await res.json();

  const el = document.getElementById("wms");
  el.innerHTML = "";

  Object.keys(data.grid || {}).slice(0, 2).forEach((rua) => {
    const ruaDiv = document.createElement("div");
    ruaDiv.className = "rua";
    ruaDiv.innerHTML = "<h3>Rua " + rua + "</h3>";

    Object.keys(data.grid[rua]).slice(0, 2).forEach((andar) => {
      const andarDiv = document.createElement("div");
      andarDiv.className = "andar";

      Object.keys(data.grid[rua][andar]).slice(0, 20).forEach((pos) => {
        const c = data.grid[rua][andar][pos];
        const div = document.createElement("div");
        div.className = "celula " + c.status;
        div.title = pos + " | " + c.produto + " | " + c.quantidade;
        div.innerText = pos;
        andarDiv.appendChild(div);
      });

      ruaDiv.appendChild(document.createTextNode("Andar " + andar));
      ruaDiv.appendChild(andarDiv);
    });

    el.appendChild(ruaDiv);
  });
}

window.onload = function () {
  testarStatus();
  listar();
  carregarWms();
};
