
let modulos=[];

async function init(){
 const res=await fetch("/api/modulos");
 const d=await res.json();
 modulos=d.modulos;
 montarMenu();
 carregar("dashboard");
}

function montarMenu(){
 const menu=document.getElementById("menu");
 menu.innerHTML="";

 modulos.forEach(m=>{
  const div=document.createElement("div");
  div.className="menu-item";
  div.innerText=m.toUpperCase();
  div.onclick=()=>carregar(m);
  menu.appendChild(div);
 });
}

async function carregar(mod){
 document.getElementById("title").innerText=mod.toUpperCase();
 const res=await fetch("/api/"+mod);
 const d=await res.json();

 const view=document.getElementById("view");
 view.innerHTML="<div class='card'>"+JSON.stringify(d.data)+"</div>";
}

window.onload=init;
