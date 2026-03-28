
let empresa="A";

function conectar(){
 const evt=new EventSource("/api/stream");
 evt.onmessage=(e)=>{
  const d=JSON.parse(e.data);
  if(d.tipo==="estoque"){
   document.getElementById("tempo").innerHTML+="<div>"+d.codigo+"</div>";
  }
  if(d.tipo==="notificacao"){
   document.getElementById("notif").innerHTML+="<div>"+d.msg+"</div>";
  }
 };
}

async function login(){
 const r=await fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user:user.value,senha:senha.value})});
 const d=await r.json();
 if(!d.ok){alert("erro");return;}
 empresa=d.usuario.empresa;
 load();
}

async function add(){
 await fetch("/api/estoque",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({codigo:codigo.value,qtd:qtd.value,empresa})});
}

async function load(){
 const d=await fetch("/api/dashboard").then(r=>r.json());
 document.getElementById("dash").innerText="Produtos: "+d.totalProdutos+" | Qtd: "+d.totalQuantidade;
}

window.onload=()=>{conectar();load();}
