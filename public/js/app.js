async function testar() {
  const res = await fetch("/api/status");
  const data = await res.json();
  document.getElementById("status").innerText = data.sistema + " - " + data.status;
}

async function adicionar(){
  await fetch("/api/estoque/entrada",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      codigo:codigo.value,
      endereco:endereco.value,
      quantidade:qtd.value
    })
  });
  listar();
}

async function listar(){
  const res = await fetch("/api/estoque");
  const data = await res.json();

  const el = document.getElementById("estoque");
  el.innerHTML = "";

  data.estoque.forEach(i=>{
    const div = document.createElement("div");
    div.innerText = i.codigo+" | "+i.endereco+" | "+i.quantidade;
    el.appendChild(div);
  });
}
