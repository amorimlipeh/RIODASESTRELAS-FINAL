function getEnd(){
 return JSON.parse(localStorage.getItem("enderecos")||"[]");
}
function saveEnd(e){
 localStorage.setItem("enderecos",JSON.stringify(e));
}

function getProdutos(){
 return JSON.parse(localStorage.getItem("produtos")||"[]");
}

function getWMS(){
 return JSON.parse(localStorage.getItem("wms")||"[]");
}
function saveWMS(w){
 localStorage.setItem("wms",JSON.stringify(w));
}

function addEndereco(){
 const val=document.getElementById("endereco").value;
 if(!val) return;
 const e=getEnd();
 e.push(val);
 saveEnd(e);
 renderEnd();
 renderSelect();
}

function renderEnd(){
 const el=document.getElementById("enderecos");
 el.innerHTML=getEnd().map(e=>`<li>${e}</li>`).join("");
}

function renderSelect(){
 const p=document.getElementById("produtoSelect");
 const e=document.getElementById("enderecoSelect");

 p.innerHTML=getProdutos().map((x,i)=>`<option value="${i}">${x.nome}</option>`).join("");
 e.innerHTML=getEnd().map((x,i)=>`<option value="${i}">${x}</option>`).join("");
}

function vincular(){
 const pidx=document.getElementById("produtoSelect").value;
 const eidx=document.getElementById("enderecoSelect").value;
 const qtd=document.getElementById("quantidade").value;

 const prod=getProdutos()[pidx];
 const end=getEnd()[eidx];

 const w=getWMS();
 w.push({produto:prod.nome,endereco:end,qtd});
 saveWMS(w);

 renderWMS();
}

function renderWMS(){
 const el=document.getElementById("wms");
 el.innerHTML=getWMS().map(w=>`<li>${w.produto} → ${w.endereco} (${w.qtd})</li>`).join("");
}

function logout(){
 localStorage.clear();
 window.location="/login";
}

window.onload=()=>{
 if(!localStorage.getItem("rio_token")){
  window.location="/login";
  return;
 }
 renderEnd();
 renderSelect();
 renderWMS();
}
