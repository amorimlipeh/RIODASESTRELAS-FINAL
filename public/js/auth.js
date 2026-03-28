
function setStatus(text, erro = false){
  const el = document.getElementById("status");
  el.textContent = text;
  el.style.color = erro ? "#ff8f8f" : "#9ee6a8";
}

function salvarSessao(token, usuario){
  localStorage.setItem("rio_token", token);
  localStorage.setItem("usuario", JSON.stringify(usuario));
}

async function login(){
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  setStatus("Entrando...");

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ email, senha })
  });

  const data = await res.json().catch(()=>({}));

  if(!res.ok || !data.ok){
    setStatus(data.erro || "Erro no login", true);
    return;
  }

  salvarSessao(data.token, data.usuario);

  setStatus("Redirecionando...");

  // 🔥 AQUI É A INTEGRAÇÃO COM SEU SISTEMA REAL
  setTimeout(()=>{
    window.location.href = "/cliente/index.html"; // ajuste se necessário
  }, 800);
}

window.onload = ()=>{
  const token = localStorage.getItem("rio_token");
  if(token){
    window.location.href = "/cliente/index.html";
  }
}
