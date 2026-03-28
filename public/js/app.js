function getEmpresa(){
 return localStorage.getItem("empresa_atual");
}

function getEstoque(){
 const emp=getEmpresa();
 return JSON.parse(localStorage.getItem("estoque_"+emp)||"[]");
}

function saveEstoque(data){
 const emp=getEmpresa();
 localStorage.setItem("estoque_"+emp, JSON.stringify(data));
}

function add(){
 const p=document.getElementById("produto").value;
 const q=document.getElementById("qtd").value;

 const data=getEstoque();
 data.push({p,q});
 saveEstoque(data);

 render();
}

function render(){
 document.getElementById("empresaAtual").innerText=getEmpresa();

 const el=document.getElementById("lista");
 const data=getEstoque();

 el.innerHTML=data.map(d=>`<li>${d.p} - ${d.q}</li>`).join("");
}

window.onload=()=>{
 if(!getEmpresa()){
  alert("Faça login primeiro");
  return;
 }
 render();
}
