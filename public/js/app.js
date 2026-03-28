
async function add(){
 const res=await fetch("/api/estoque",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({codigo:codigo.value,qtd:qtd.value})
 });

 const d=await res.json();
 alert("Endereço sugerido: "+d.endereco);
 load();
}

async function load(){
 const r=await fetch("/api/estoque");
 const d=await r.json();

 const el=document.getElementById("list");
 el.innerHTML="";

 d.estoque.forEach(i=>{
  const div=document.createElement("div");
  div.innerText=i.codigo+" | "+i.qtd+" | "+i.endereco;
  el.appendChild(div);
 });
}

window.onload=load;
