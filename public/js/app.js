
function conectar(){
 const evt=new EventSource("/api/stream");

 evt.onmessage=(e)=>{
  const data=JSON.parse(e.data);

  if(data.tipo==="estoque"){
   const el=document.getElementById("tempoReal");
   const div=document.createElement("div");
   div.innerText="Atualização: "+data.codigo+" "+data.qtd;
   el.appendChild(div);
  }
 };
}

async function add(){
 await fetch("/api/estoque",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({codigo:codigo.value,qtd:qtd.value})
 });
}

window.onload=conectar;
