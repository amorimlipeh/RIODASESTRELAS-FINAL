async function criarPedido(){
 const itens=[{codigo:"TESTE",quantidade:5}];

 const res=await fetch("/api/pedido",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({itens})
 });
 const d=await res.json();
 document.getElementById("res").innerText="Pedido "+d.p.id;
}
