
async function load(){
 const e=await fetch("/api/estoque").then(r=>r.json());
 const n=await fetch("/api/notificacoes").then(r=>r.json());

 const el=document.getElementById("estoque");
 el.innerHTML="";
 e.estoque.forEach(i=>{
  const div=document.createElement("div");
  div.innerText=i.codigo+" | "+i.qtd;
  el.appendChild(div);
 });

 const notif=document.getElementById("notificacoes");
 notif.innerHTML="";
 n.notificacoes.forEach(x=>{
  const div=document.createElement("div");
  div.innerText=x.msg;
  notif.appendChild(div);
 });
}

setInterval(load,2000);
window.onload=load;
