
function getEmpresa(){return localStorage.getItem("empresa_atual")||"";}
function getKey(t){return t+"_"+getEmpresa();}
function getData(t){return JSON.parse(localStorage.getItem(getKey(t))||"[]");}
function save(t,d){localStorage.setItem(getKey(t),JSON.stringify(d));}

function mostrar(id){
 document.querySelectorAll('.modulo').forEach(m=>m.classList.add('hidden'));
 document.getElementById(id).classList.remove('hidden');
}

function add(){
 const p=document.getElementById("produto").value.trim();
 const q=parseInt(document.getElementById("qtd").value);
 if(!p||!q)return;
 let d=getData("estoque");
 let e=d.find(i=>i.p===p);
 if(e){e.q+=q}else{d.push({p,q})}
 save("estoque",d);render();
}

function validarEndereco(e){return /^\d{2}-\d{3}-\d-\d$/.test(e);}

function addEndereco(){
 const e=document.getElementById("endereco").value.trim();
 if(!validarEndereco(e)){alert("Formato 05-001-3-1");return;}
 let w=getData("wms");
 if(w.find(x=>x.endereco===e)){alert("Existe");return;}
 w.push({endereco:e,produto:"",qtd:0});
 save("wms",w);render();
}

function render(){
 document.getElementById("emp").innerText=getEmpresa();

 let est=getData("estoque");
 document.getElementById("lista").innerHTML=est.map(i=>`<li>${i.p}-${i.q}</li>`).join("");

 let w=getData("wms");
 document.getElementById("wms_lista").innerHTML=w.map(i=>`<li>${i.endereco}</li>`).join("");

 let grid=document.getElementById("grid");
 grid.innerHTML=w.map(i=>`<div class="cell">${i.endereco}<br>${i.produto||""}</div>`).join("");
}

render();
