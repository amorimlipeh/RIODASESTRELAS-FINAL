async function importar(){
 const f=document.getElementById("file").files[0];
 const fd=new FormData();
 fd.append("file",f);

 const res=await fetch("/api/importar-aplicar",{method:"POST",body:fd});
 const d=await res.json();

 alert("Importado: "+d.total);
 listar();
}

async function listar(){
 const res=await fetch("/api/estoque");
 const d=await res.json();

 const el=document.getElementById("list");
 el.innerHTML="";

 d.estoque.forEach(i=>{
  const div=document.createElement("div");
  div.innerText=i.codigo+" | "+i.quantidade;
  el.appendChild(div);
 });
}
