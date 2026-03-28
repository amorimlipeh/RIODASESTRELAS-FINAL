
async function add(){
 await fetch("/api/estoque",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({codigo:codigo.value,qtd:qtd.value})
 });
 load();
}

async function load(){
 const e=await fetch("/api/estoque").then(r=>r.json());
 const l=await fetch("/api/logs").then(r=>r.json());

 const el=document.getElementById("estoque");
 el.innerHTML="";
 e.estoque.forEach(i=>{
  const d=document.createElement("div");
  d.innerText=i.codigo+" | "+i.qtd;
  el.appendChild(d);
 });

 const logEl=document.getElementById("logs");
 logEl.innerHTML="";
 l.logs.forEach(x=>{
  const d=document.createElement("div");
  d.innerText=x.msg+" - "+x.time;
  logEl.appendChild(d);
 });
}

window.onload=load;
