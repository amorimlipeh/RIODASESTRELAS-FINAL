function getEmpresas(){
 return JSON.parse(localStorage.getItem("empresas")||"[]");
}

function saveEmpresas(e){
 localStorage.setItem("empresas",JSON.stringify(e));
}

function addEmpresa(){
 const nome=document.getElementById("empresa").value;
 const status=document.getElementById("status").value;

 if(!nome) return;

 const e=getEmpresas();
 e.push({nome,status});
 saveEmpresas(e);

 render();
}

function render(){
 const el=document.getElementById("empresas");
 el.innerHTML=getEmpresas().map((e,i)=>`
 <li>
 ${e.nome} - ${e.status}
 <button onclick="toggle(${i})">Alterar</button>
 </li>`).join("");
}

function toggle(i){
 const e=getEmpresas();
 e[i].status = e[i].status==="ativo"?"bloqueado":"ativo";
 saveEmpresas(e);
 render();
}

window.onload=()=>{
 render();
}
