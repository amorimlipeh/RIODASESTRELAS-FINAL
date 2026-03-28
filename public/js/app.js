
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

// ================= ESTOQUE =================
function getEstoque(){ return getData("estoque"); }
function saveEstoque(d){ save("estoque", d); }

function add(){
  const p = document.getElementById("produto").value.trim();
  const q = parseInt(document.getElementById("qtd").value);
  if(!p || !q) return;

  let data = getEstoque();
  const ex = data.find(i=>i.p===p);

  if(ex){ ex.q += q; }
  else{ data.push({p,q}); }

  saveEstoque(data);
  render();
}

// ================= WMS =================
function validarEndereco(end){
  return /^\d{2}-\d{3}-\d-\d$/.test(end);
}

function addEndereco(){
  const end = document.getElementById("endereco").value.trim();
  if(!validarEndereco(end)){
    alert("Use 05-001-3-1");
    return;
  }

  let lista = getData("wms");

  if(lista.find(e=>e.endereco===end)){
    alert("Já existe");
    return;
  }

  lista.push({ endereco:end, produto:"", qtd:0 });
  save("wms",lista);
  render();
}

function vincular(index){
  let lista = getData("wms");
  const p = prompt("Produto:");
  const q = parseInt(prompt("Qtd:"));
  if(!p || !q) return;

  lista[index].produto = p;
  lista[index].qtd = q;

  save("wms",lista);
  render();
}

function removerEndereco(index){
  let lista = getData("wms");
  lista.splice(index,1);
  save("wms",lista);
  render();
}

// ================= RENDER =================
function render(){
  const emp = getEmpresa();
  if(!emp){ window.location="/login"; return; }

  document.getElementById("emp").innerText = emp;

  // estoque
  let est = getEstoque();
  document.getElementById("lista").innerHTML =
    est.map(i=>`<li>${i.p} - ${i.q}</li>`).join("");

  // wms
  let w = getData("wms");
  document.getElementById("wms").innerHTML =
    w.map((e,i)=>`
      <li>
        ${e.endereco} → ${e.produto || "vazio"} (${e.qtd})
        <button onclick="vincular(${i})">📦</button>
        <button onclick="removerEndereco(${i})">❌</button>
      </li>
    `).join("");
}

render();
