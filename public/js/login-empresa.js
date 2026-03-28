function getEmpresas(){
  return JSON.parse(localStorage.getItem("empresas") || "[]");
}

function renderEmpresas(){
  const sel = document.getElementById("empresa");
  const empresas = getEmpresas();
  sel.innerHTML = empresas.map(e => `<option value="${e.nome}">${e.nome}</option>`).join("");
}

function setStatus(texto, erro=false){
  const el = document.getElementById("status");
  if(!el) return;
  el.textContent = texto || "";
  el.style.color = erro ? "#ff8f8f" : "#9ee6a8";
}

function sessaoValida(){
  const token = localStorage.getItem("rio_token");
  const empresa = localStorage.getItem("empresa_atual");
  return !!(token && empresa);
}

function limparSessaoInvalida(){
  const token = localStorage.getItem("rio_token");
  const empresa = localStorage.getItem("empresa_atual");
  if(token && !empresa){
    localStorage.removeItem("rio_token");
    localStorage.removeItem("usuario");
  }
}

function login(){
  const empresa = document.getElementById("empresa").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  const empresas = getEmpresas();
  const emp = empresas.find(e => e.nome === empresa);

  if(!emp){
    setStatus("Empresa não encontrada", true);
    return;
  }

  if(emp.status === "bloqueado"){
    setStatus("Empresa bloqueada", true);
    return;
  }

  if(!email || !senha){
    setStatus("Preencha email e senha", true);
    return;
  }

  // login local/base
  localStorage.setItem("rio_token", "ok");
  localStorage.setItem("empresa_atual", empresa);
  localStorage.setItem("usuario", JSON.stringify({
    email,
    empresa,
    tipo: "admin"
  }));

  setStatus("Entrando...");
  setTimeout(() => {
    window.location.href = "/app";
  }, 300);
}

document.addEventListener("DOMContentLoaded", function(){
  renderEmpresas();
  limparSessaoInvalida();

  const btn = document.getElementById("btnEntrar");
  if(btn) btn.addEventListener("click", login);

  const senha = document.getElementById("senha");
  if(senha){
    senha.addEventListener("keydown", function(e){
      if(e.key === "Enter") login();
    });
  }

  if(sessaoValida()){
    window.location.href = "/app";
  }
});
