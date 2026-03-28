function getWMS(){
 return JSON.parse(localStorage.getItem("wms")||"[]");
}

function gerarGrid(){
 const grid=document.getElementById("grid");
 let html="";

 for(let i=1;i<=20;i++){
  let endereco="05-"+String(i).padStart(3,"0")+"-1-1";

  let ocupado=getWMS().find(w=>w.endereco===endereco);

  html+=`<div class="cell ${ocupado?'ocupado':''}">
  ${endereco}<br>
  ${ocupado?ocupado.produto:''}
  </div>`;
 }

 grid.innerHTML=html;
}

window.onload=gerarGrid;
