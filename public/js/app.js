
let empresa="A";

async function login(){
 const res=await fetch("/api/login",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({user:user.value,senha:senha.value})
 });

 const d=await res.json();
 if(!d.ok){alert("erro");return;}

 empresa=d.usuario.empresa;
 alert("logado "+empresa);
 load();
}

async function add(){
 await fetch("/api/estoque",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({codigo:codigo.value,qtd:qtd.value,empresa})
 });
 load();
}

async function load(){
 const res=await fetch("/api/estoque/"+empresa);
 const d=await res.json();

 const el=document.getElementById("list");
 el.innerHTML="";
 d.estoque.forEach(i=>{
  const div=document.createElement("div");
  div.innerText=i.codigo+" | "+i.qtd;
  el.appendChild(div);
 });
}
