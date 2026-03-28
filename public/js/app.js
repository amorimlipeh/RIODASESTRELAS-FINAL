
async function calc(){
 const itens=document.getElementById("itens").value.split(",");
 const res=await fetch("/api/rota",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({itens})
 });

 const d=await res.json();

 const el=document.getElementById("rota");
 el.innerHTML="";

 d.rota.forEach(i=>{
  const div=document.createElement("div");
  div.innerText=i.codigo+" → "+i.endereco;
  el.appendChild(div);
 });
}
