
let rota=[];
let index=0;

async function start(){
 const r=await fetch("/api/picking");
 const d=await r.json();
 rota=d.rota;
 index=0;
 falar();
}

function falar(){
 if(index>=rota.length) return;

 const item=rota[index];
 const texto=`Rua ${item.endereco}, pegar ${item.qtd} caixas do produto ${item.codigo}`;

 const msg=new SpeechSynthesisUtterance(texto);
 speechSynthesis.speak(msg);

 document.getElementById("log").innerHTML+=`<div>${texto}</div>`;

 msg.onend=()=>{
  index++;
  falar();
 };
}
