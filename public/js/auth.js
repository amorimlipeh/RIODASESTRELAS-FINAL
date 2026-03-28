
function setStatus(text, erro = false){
  const el = document.getElementById("status");
  if(!el) return;
  el.textContent = text;
  el.style.color = erro ? "#ff8f8f" : "#9ee6a8";
}

function salvarSessao(token, usuario){
  localStorage.setItem("rio_token", token);
  localStorage.setItem("usuario", JSON.stringify(usuario));
}

function obterToken(){
  return localStorage.getItem("rio_token") || "";
}

async function fazerLogin(){
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  setStatus("Entrando...");

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ email, senha })
    });

    const data = await res.json().catch(() => ({}));

    if(!res.ok || !data.ok){
      setStatus(data.erro || "Erro no login", true);
      return;
    }

    salvarSessao(data.token, data.usuario);

    setStatus("Login realizado. Entrando...");

    setTimeout(() => {
      window.location.href = "/app";
    }, 500);

  } catch (e) {
    setStatus("Erro de conexão", true);
  }
}

window.onload = async () => {
  const btnEntrar = document.getElementById("btnEntrar");
  const senha = document.getElementById("senha");

  if(btnEntrar) btnEntrar.addEventListener("click", fazerLogin);
  if(senha){
    senha.addEventListener("keydown", (e)=>{
      if(e.key === "Enter") fazerLogin();
    });
  }

  const token = obterToken();

  // 🔥 AUTO LOGIN REAL
  if(token){
    window.location.href = "/app";
  }
};
