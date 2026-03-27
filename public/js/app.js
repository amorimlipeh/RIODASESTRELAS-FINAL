let dados=[];
let page=0;
const limit=20;

async function importar(){
 const file=document.getElementById("file").files[0];
 const fd=new FormData();
 fd.append("file",file);

 const res=await fetch("/api/importar",{method:"POST",body:fd});
 const data=await res.json();

 if(!data.ok){ alert(data.erro); return; }

 dados=data.preview;
 page=0;
 abrir();
 render();
}

function abrir(){ document.getElementById("modal").classList.remove("hidden"); }
function fechar(){ document.getElementById("modal").classList.add("hidden"); }

function render(){
 const start=page*limit;
 const slice=dados.slice(start,start+limit);

 let html="<table><tr>";
 if(slice.length){
  Object.keys(slice[0]).forEach(c=> html+=`<th>${c}</th>`);
 }
 html+="</tr>";

 slice.forEach(r=>{
  html+="<tr>";
  Object.values(r).forEach(v=> html+=`<td>${v}</td>`);
  html+="</tr>";
 });

 html+="</table>";

 document.getElementById("tabela").innerHTML=html;
 document.getElementById("page").innerText="Página "+(page+1);
}

function next(){ page++; render(); }
function prev(){ if(page>0) page--; render(); }
