
let currentUser = "";

function getHeaders(){
  return {
    "Content-Type":"application/json",
    "x-user": currentUser
  };
}

async function login(){
  const res = await fetch("/api/login", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
      user: document.getElementById("user").value,
      senha: document.getElementById("senha").value
    })
  });
  const data = await res.json();

  if(!data.ok){
    document.getElementById("loginStatus").innerText = "Login inválido";
    return;
  }

  currentUser = data.usuario.user;
  document.getElementById("loginStatus").innerText = "Logado como " + data.usuario.user + " (" + data.usuario.tipo + ")";
  carregarPainel();
}

async function criarEmpresa(){
  await fetch("/api/dev/empresa", {
    method:"POST",
    headers:getHeaders(),
    body: JSON.stringify({
      nome: document.getElementById("empresaNome").value,
      plano: document.getElementById("empresaPlano").value,
      liberarTeste: document.getElementById("liberarTeste").checked
    })
  });
  carregarPainel();
}

async function liberarTesteEmpresa(){
  await fetch("/api/dev/liberar-teste", {
    method:"POST",
    headers:getHeaders(),
    body: JSON.stringify({
      empresa: document.getElementById("empresaTeste").value,
      dias: document.getElementById("diasTeste").value
    })
  });
  carregarPainel();
}

async function criarUsuario(){
  const permissoes = document.getElementById("novasPermissoes").value
    .split(",")
    .map(x => x.trim())
    .filter(Boolean);

  await fetch("/api/dev/usuario", {
    method:"POST",
    headers:getHeaders(),
    body: JSON.stringify({
      user: document.getElementById("novoUser").value,
      senha: document.getElementById("novaSenha").value,
      empresa: document.getElementById("novaEmpresa").value,
      tipo: document.getElementById("novoTipo").value,
      permissoes
    })
  });
  carregarPainel();
}

async function alterarPlano(){
  await fetch("/api/dev/plano", {
    method:"POST",
    headers:getHeaders(),
    body: JSON.stringify({
      empresa: document.getElementById("planoEmpresa").value,
      plano: document.getElementById("novoPlano").value
    })
  });
  carregarPainel();
}

async function alterarPermissoes(){
  const permissoes = document.getElementById("permLista").value
    .split(",")
    .map(x => x.trim())
    .filter(Boolean);

  await fetch("/api/dev/permissoes", {
    method:"POST",
    headers:getHeaders(),
    body: JSON.stringify({
      user: document.getElementById("permUser").value,
      permissoes
    })
  });
  carregarPainel();
}

async function carregarPainel(){
  const res = await fetch("/api/dev/painel", {
    headers: {
      "x-user": currentUser
    }
  });

  const data = await res.json();
  document.getElementById("painel").innerText = JSON.stringify(data, null, 2);
}
