
async function load(){
 const d=await fetch("/api/dashboard").then(r=>r.json());
 const e=await fetch("/api/estoque").then(r=>r.json());

 document.getElementById("totalProd").innerText=d.totalProdutos;
 document.getElementById("totalQtd").innerText=d.totalQuantidade;

 const el=document.getElementById("lista");
 el.innerHTML="";
 e.estoque.forEach(i=>{
  const div=document.createElement("div");
  div.innerText=i.codigo+" | "+i.qtd;
  el.appendChild(div);
 });
}

setInterval(load,2000);
window.onload=load;
