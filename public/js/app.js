function getEmpresa(){
  return localStorage.getItem("empresa_atual") || "";
}

function getEstoque(){
  const emp = getEmpresa();
  return JSON.parse(localStorage.getItem("estoque_" + emp) || "[]");
}

function saveEstoque(data){
  const emp = getEmpresa();
  localStorage.setItem("estoque_" + emp, JSON.stringify(data));
}

function render(){
  const empresa = getEmpresa();
  if(!empresa){
    localStorage.removeItem("rio_token");
    localStorage.removeItem("usuario");
    window.location.href = "/login";
    return;
  }

  document.getElementById("empresaAtual").innerText = empresa;

  const el = document.getElementById("lista");
  const data = getEstoque();
  el.innerHTML = data.map(d => `<li>${d.p} - ${d.q}</li>`).join("");
}

function add(){
  const p = document.getElementById("produto").value;
  const q = document.getElementById("qtd").value;
  if(!p || !q) return;

  const data = getEstoque();
  data.push({p, q});
  saveEstoque(data);

  document.getElementById("produto").value = "";
  document.getElementById("qtd").value = "";
  render();
}

function sair(){
  localStorage.removeItem("rio_token");
  localStorage.removeItem("usuario");
  localStorage.removeItem("empresa_atual");
  window.location.href = "/login";
}

function trocarEmpresa(){
  localStorage.removeItem("empresa_atual");
  window.location.href = "/login";
}

document.addEventListener("DOMContentLoaded", function(){
  const token = localStorage.getItem("rio_token");
  const empresa = getEmpresa();

  if(!token || !empresa){
    localStorage.removeItem("rio_token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("empresa_atual");
    window.location.href = "/login";
    return;
  }

  const btnAdd = document.getElementById("btnAdicionar");
  const btnSair = document.getElementById("btnSair");
  const btnTrocar = document.getElementById("btnTrocarEmpresa");

  if(btnAdd) btnAdd.addEventListener("click", add);
  if(btnSair) btnSair.addEventListener("click", sair);
  if(btnTrocar) btnTrocar.addEventListener("click", trocarEmpresa);

  render();
});
