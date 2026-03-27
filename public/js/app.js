async function add(){
 await fetch("/api/estoque",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({codigo:codigo.value,qtd:qtd.value})
 });
 listar();
}

async function listar(){
 const res=await fetch("/api/estoque");
 const d=await res.json();

 const el=document.getElementById("lista");
 el.innerHTML="";

 d.estoque.forEach(i=>{
  const div=document.createElement("div");
  div.innerText=i.codigo+" | "+i.qtd;
  el.appendChild(div);
 });
}

window.onload=listar;
