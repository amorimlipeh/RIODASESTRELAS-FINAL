
function getEmpresa(){
  return localStorage.getItem("empresa_atual") || "";
}

function getKey(tipo){
  return tipo + "_" + getEmpresa();
}

function getData(tipo){
  return JSON.parse(localStorage.getItem(getKey(tipo)) || "[]");
}

function save(tipo,data){
  localStorage.setItem(getKey(tipo), JSON.stringify(data));
}

// ================= PEDIDOS =================
function criarPedido(){
  const produto = document.getElementById("pedido_produto").value.trim();
  const qtd = parseInt(document.getElementById("pedido_qtd").value);

  if(!produto || !qtd) return;

  let pedidos = getData("pedidos");

  pedidos.push({
    id: Date.now(),
    produto,
    qtd,
    status: "pendente"
  });

  save("pedidos", pedidos);
  renderPicking();
}

// ================= SEPARAÇÃO =================
function iniciarSeparacao(id){
  let pedidos = getData("pedidos");
  let pedido = pedidos.find(p=>p.id===id);

  if(pedido){
    pedido.status = "separando";
  }

  save("pedidos", pedidos);
  renderPicking();
}

function concluirPedido(id){
  let pedidos = getData("pedidos");
  let pedido = pedidos.find(p=>p.id===id);

  if(pedido){
    pedido.status = "concluido";
  }

  save("pedidos", pedidos);
  renderPicking();
}

// ================= WMS BUSCA =================
function buscarEndereco(produto){
  let wms = getData("wms");
  let item = wms.find(e=>e.produto === produto);
  return item ? item.endereco : "sem endereço";
}

// ================= RENDER =================
function renderPicking(){
  const emp = getEmpresa();
  if(!emp){ window.location="/login"; return; }

  let pedidos = getData("pedidos");

  document.getElementById("pedidos").innerHTML =
    pedidos.map(p=>`
      <li>
        ${p.produto} (${p.qtd}) - ${p.status}
        <br>
        📍 ${buscarEndereco(p.produto)}
        <br>
        ${
          p.status === "pendente"
          ? `<button onclick="iniciarSeparacao(${p.id})">Separar</button>`
          : ""
        }
        ${
          p.status === "separando"
          ? `<button onclick="concluirPedido(${p.id})">Concluir</button>`
          : ""
        }
      </li>
    `).join("");
}

renderPicking();
