let pedidos=[];
let etapa=0;

function getWMS(){
 return JSON.parse(localStorage.getItem("wms")||"[]");
}

function addPedido(){
 const produto=document.getElementById("produto").value;
 const qtd=document.getElementById("qtd").value;

 pedidos.push({produto,qtd});
 renderPedido();
}

function renderPedido(){
 const el=document.getElementById("pedido");
 el.innerHTML=pedidos.map(p=>`<li>${p.produto} - ${p.qtd}</li>`).join("");
}

function iniciar(){
 etapa=0;
 mostrar();
}

function mostrar(){
 const wms=getWMS();
 const atual=pedidos[etapa];
 if(!atual) return;

 const local=wms.find(w=>w.produto===atual.produto);

 document.getElementById("picking").innerHTML=`
 Vá para: ${local?local.endereco:"N/A"}<br>
 Retire: ${atual.produto} (${atual.qtd})
 `;
}

function proximo(){
 etapa++;
 mostrar();
}

window.onload=()=>{
 if(!localStorage.getItem("rio_token")){
  window.location="/login";
 }
}
