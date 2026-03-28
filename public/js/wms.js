
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

function validarEndereco(end){
  return /^\d{2}-\d{3}-\d-\d$/.test(end);
}

function addEndereco(){
  const end = document.getElementById("endereco").value.trim();

  if(!validarEndereco(end)){
    alert("Formato inválido. Use 05-001-3-1");
    return;
  }

  let lista = getData("wms");

  if(lista.find(e=>e.endereco===end)){
    alert("Endereço já existe");
    return;
  }

  lista.push({ endereco:end, produto:"", qtd:0 });
  save("wms",lista);

  renderWMS();
}

function vincular(index){
  let lista = getData("wms");
  const produto = prompt("Produto:");
  const qtd = parseInt(prompt("Quantidade:"));

  if(!produto || !qtd) return;

  lista[index].produto = produto;
  lista[index].qtd = qtd;

  save("wms",lista);
  renderWMS();
}

function removerEndereco(index){
  let lista = getData("wms");
  lista.splice(index,1);
  save("wms",lista);
  renderWMS();
}

function renderWMS(){
  const emp = getEmpresa();
  if(!emp){
    window.location="/login";
    return;
  }

  let lista = getData("wms");

  document.getElementById("wms").innerHTML =
    lista.map((e,i)=>`
      <li>
        ${e.endereco} → ${e.produto || "vazio"} (${e.qtd})
        <button onclick="vincular(${i})">📦</button>
        <button onclick="removerEndereco(${i})">❌</button>
      </li>
    `).join("");
}

renderWMS();
