function getEmpresas(){
 return JSON.parse(localStorage.getItem("empresas")||"[]");
}

function renderEmpresas(){
 const sel=document.getElementById("empresa");
 const empresas=getEmpresas();
 sel.innerHTML=empresas.map(e=>`<option value="${e.nome}">${e.nome}</option>`).join("");
}

function login(){
 const empresa=document.getElementById("empresa").value;
 const email=document.getElementById("email").value;
 const senha=document.getElementById("senha").value;

 const empresas=getEmpresas();
 const emp=empresas.find(e=>e.nome===empresa);

 if(!emp){
  document.getElementById("status").innerText="Empresa não encontrada";
  return;
 }

 if(emp.status==="bloqueado"){
  document.getElementById("status").innerText="Empresa bloqueada";
  return;
 }

 // login fake por enquanto
 localStorage.setItem("rio_token","ok");
 localStorage.setItem("empresa_atual",empresa);

 window.location="/app";
}

window.onload=()=>{
 renderEmpresas();
}
