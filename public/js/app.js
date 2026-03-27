let dados=[];
let colunasSelecionadas={};

async function importar(){
 const f=document.getElementById("file").files[0];
 const fd=new FormData();
 fd.append("file",f);

 const res=await fetch("/api/importar",{method:"POST",body:fd});
 const data=await res.json();

 if(!data.ok){alert(data.erro);return;}

 dados=data.preview;
 initColunas();
 abrir();
 render();
}

function abrir(){document.getElementById("modal").classList.remove("hidden");}

function initColunas(){
 const c=Object.keys(dados[0]||{});
 const box=document.getElementById("colunas");
 box.innerHTML="";

 c.forEach(k=>{
  colunasSelecionadas[k]=true;
  const label=document.createElement("label");
  label.innerHTML=`<input type="checkbox" checked onchange="toggleCol('${k}',this)"> ${k}`;
  box.appendChild(label);
 });
}

function toggleCol(nome,el){
 colunasSelecionadas[nome]=el.checked;
 render();
}

function toggleColunas(){
 document.getElementById("colunas").classList.toggle("hidden");
}

function render(){
 let html="<table><tr>";

 const cols=Object.keys(colunasSelecionadas).filter(c=>colunasSelecionadas[c]);

 cols.forEach(c=> html+=`<th draggable="true" ondragstart="drag(event)" id="${c}">${c}</th>`);

 html+="</tr>";

 dados.forEach(r=>{
  html+="<tr>";
  cols.forEach(c=> html+=`<td>${r[c]||""}</td>`);
  html+="</tr>";
 });

 html+="</table>";

 document.getElementById("tabela").innerHTML=html;
}

function aplicar(){
 alert("Importação aplicada (próxima fase integra backend)");
}

let dragSrc;
function drag(e){ dragSrc=e.target.id; }
