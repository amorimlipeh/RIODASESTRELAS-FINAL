
let currentUser = "";
let currentEmpresa = "EMPRESA_TESTE";
let evtSource = null;

function headers(json = true){
  const h = { "x-empresa": currentEmpresa, "x-user": currentUser };
  if (json) h["Content-Type"] = "application/json";
  return h;
}

async function login(){
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({
      user: document.getElementById("user").value,
      senha: document.getElementById("senha").value
    })
  });
  const data = await res.json();
  if(!data.ok){
    document.getElementById("loginStatus").innerText = "Login inválido";
    return;
  }
  currentUser = data.usuario.user;
  currentEmpresa = data.usuario.empresa === "MASTER" ? "EMPRESA_TESTE" : data.usuario.empresa;
  document.getElementById("loginStatus").innerText = "Logado como " + data.usuario.user + " | empresa: " + currentEmpresa;
  conectarTempoReal();
  await carregarTudo();
}

function conectarTempoReal(){
  if(evtSource) evtSource.close();
  evtSource = new EventSource("/api/stream");
  evtSource.onmessage = (e) => {
    const data = JSON.parse(e.data);
    const el = document.getElementById("tempoReal");
    const div = document.createElement("div");
    div.innerText = JSON.stringify(data);
    el.prepend(div);
  };
}

async function adicionarEstoque(){
  await fetch("/api/estoque", {
    method:"POST",
    headers: headers(),
    body: JSON.stringify({
      codigo: document.getElementById("codigo").value,
      qtd: document.getElementById("qtd").value,
      endereco: document.getElementById("endereco").value
    })
  });
  await carregarTudo();
}

async function buscarSugestao(){
  const res = await fetch("/api/wms/sugestao", { headers: headers(false) });
  const data = await res.json();
  document.getElementById("sugestao").innerText = data.ok ? ("Endereço sugerido: " + data.endereco) : data.erro;
}

async function previewImportacao(){
  const file = document.getElementById("file").files[0];
  if(!file) return;
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/importar?empresa="+encodeURIComponent(currentEmpresa), {
    method:"POST",
    headers: { "x-empresa": currentEmpresa },
    body: fd
  });
  const data = await res.json();
  document.getElementById("importador").innerText = JSON.stringify(data, null, 2);
}

async function aplicarImportacao(){
  const file = document.getElementById("file").files[0];
  if(!file) return;
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/importar-aplicar?empresa="+encodeURIComponent(currentEmpresa), {
    method:"POST",
    headers: { "x-empresa": currentEmpresa },
    body: fd
  });
  const data = await res.json();
  document.getElementById("importador").innerText = JSON.stringify(data, null, 2);
  await carregarTudo();
}

async function criarPedido(){
  const itens = document.getElementById("pedidoItens").value
    .split(",")
    .map(x => x.trim())
    .filter(Boolean)
    .map(codigo => ({ codigo, quantidade: 1 }));

  const res = await fetch("/api/pedido", {
    method:"POST",
    headers: headers(),
    body: JSON.stringify({ itens })
  });
  const data = await res.json();
  document.getElementById("pedidoSaida").innerText = JSON.stringify(data, null, 2);
}

async function calcularRota(){
  const itens = document.getElementById("pedidoItens").value
    .split(",")
    .map(x => x.trim())
    .filter(Boolean);

  const res = await fetch("/api/rota", {
    method:"POST",
    headers: headers(),
    body: JSON.stringify({ itens })
  });
  const data = await res.json();
  document.getElementById("pedidoSaida").innerText = JSON.stringify(data, null, 2);
}

async function iniciarVoz(){
  const res = await fetch("/api/picking-voz", { headers: headers(false) });
  const data = await res.json();
  if(!data.ok) return;

  const rota = data.rota || [];
  let idx = 0;

  function falarProximo(){
    if(idx >= rota.length) return;
    const item = rota[idx];
    const texto = `Rua ${item.endereco}, pegar ${item.qtd} caixas do produto ${item.codigo}`;
    const msg = new SpeechSynthesisUtterance(texto);
    speechSynthesis.speak(msg);
    idx += 1;
    msg.onend = falarProximo;
  }

  falarProximo();
}

async function carregarDashboard(){
  const d = await fetch("/api/dashboard", { headers: headers(false) }).then(r=>r.json());
  document.getElementById("dashboard").innerHTML =
    `<div>Total produtos: ${d.totalProdutos}</div>
     <div>Total quantidade: ${d.totalQuantidade}</div>
     <div>Total reservado: ${d.totalReservado}</div>
     <div>Alertas baixos: ${d.alertasBaixos}</div>`;
}

async function carregarIA(){
  const d = await fetch("/api/ia", { headers: headers(false) }).then(r=>r.json());
  const el = document.getElementById("ia");
  el.innerHTML = "";
  (d.alertas || []).forEach(x => {
    const div = document.createElement("div");
    div.innerText = "⚠️ " + x;
    el.appendChild(div);
  });
  (d.sugestoes || []).forEach(x => {
    const div = document.createElement("div");
    div.innerText = "💡 " + x;
    el.appendChild(div);
  });
}

async function carregarEstoque(){
  const d = await fetch("/api/estoque", { headers: headers(false) }).then(r=>r.json());
  const el = document.getElementById("estoque");
  el.innerHTML = "";
  (d.estoque || []).forEach(i => {
    const div = document.createElement("div");
    div.innerText = `${i.codigo} | ${i.quantidade} | ${i.endereco} | reservado: ${i.reservado}`;
    el.appendChild(div);
  });
}

async function carregarWms(){
  const d = await fetch("/api/wms", { headers: headers(false) }).then(r=>r.json());
  const el = document.getElementById("wms");
  el.innerHTML = "";

  Object.keys(d.grid || {}).slice(0,2).forEach(rua => {
    const wrap = document.createElement("div");
    wrap.innerHTML = `<h3>Rua ${rua}</h3>`;
    Object.keys(d.grid[rua]).slice(0,2).forEach(andar => {
      const line = document.createElement("div");
      line.innerHTML = `<div>Andar ${andar}</div>`;
      Object.keys(d.grid[rua][andar]).slice(0,15).forEach(pos => {
        const c = d.grid[rua][andar][pos];
        const cel = document.createElement("div");
        cel.className = "celula " + c.status;
        cel.title = `${pos} | ${c.produto} | ${c.quantidade}`;
        cel.innerText = pos;
        line.appendChild(cel);
      });
      wrap.appendChild(line);
    });
    el.appendChild(wrap);
  });
}

async function carregarLogs(){
  const d = await fetch("/api/logs", { headers: headers(false) }).then(r=>r.json());
  const el = document.getElementById("logs");
  el.innerHTML = "";
  (d.logs || []).slice(0,20).forEach(i => {
    const div = document.createElement("div");
    div.innerText = `${i.time} - ${i.msg}`;
    el.appendChild(div);
  });
}

async function carregarNotificacoes(){
  const d = await fetch("/api/notificacoes", { headers: headers(false) }).then(r=>r.json());
  const el = document.getElementById("notificacoes");
  el.innerHTML = "";
  (d.notificacoes || []).slice(0,20).forEach(i => {
    const div = document.createElement("div");
    div.innerText = `${i.time} - ${i.msg}`;
    el.appendChild(div);
  });
}

async function carregarPainelDev(){
  const res = await fetch("/api/dev/painel", {
    headers: { "x-user": currentUser }
  });
  const data = await res.json();
  document.getElementById("painelDev").innerText = JSON.stringify(data, null, 2);
}

async function carregarTudo(){
  await Promise.all([
    carregarDashboard(),
    carregarIA(),
    carregarEstoque(),
    carregarWms(),
    carregarLogs(),
    carregarNotificacoes()
  ]);
  if(currentUser === "desenvolvedor") {
    await carregarPainelDev();
  }
}

window.onload = async () => {
  await login();
};
