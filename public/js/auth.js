function setStatus(text, erro = false){
  const el = document.getElementById("status");
  el.textContent = text;
  el.style.color = erro ? "#ff8f8f" : "#9ee6a8";
}

function salvarToken(token){
  localStorage.setItem("rio_token", token);
}

function obterToken(){
  return localStorage.getItem("rio_token") || "";
}

async function login(){
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  setStatus("Entrando...");

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha })
  });

  const data = await res.json().catch(() => ({}));

  if(!res.ok || !data.ok){
    setStatus(data.erro || "Falha no login", true);
    return;
  }

  salvarToken(data.token);
  document.getElementById("usuario").textContent = JSON.stringify(data.usuario, null, 2);
  setStatus("Login realizado com sucesso");
}

async function testarAuth(){
  const token = obterToken();

  const res = await fetch("/api/auth-check", {
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  const data = await res.json().catch(() => ({}));
  document.getElementById("resultado").textContent = JSON.stringify(data, null, 2);
}

window.onload = async () => {
  const token = obterToken();
  if(!token) return;

  const res = await fetch("/api/auth/me", {
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  const data = await res.json().catch(() => ({}));
  if(data.ok){
    document.getElementById("usuario").textContent = JSON.stringify(data.usuario, null, 2);
    setStatus("Sessão restaurada");
  }
};
