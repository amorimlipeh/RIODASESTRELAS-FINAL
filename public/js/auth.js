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

    const usuarioEl = document.getElementById("usuario");
    if(usuarioEl){
      usuarioEl.textContent = JSON.stringify(data.usuario, null, 2);
    }

    setStatus("Login realizado com sucesso. Redirecionando...");

    setTimeout(() => {
      window.location.href = "/app";
    }, 700);
  } catch (e) {
    setStatus("Falha de conexão no login", true);
  }
}

async function testarAuth(){
  const token = obterToken();

  try {
    const res = await fetch("/api/auth-check", {
      headers: { "Authorization": "Bearer " + token }
    });

    const data = await res.json().catch(() => ({}));
    const out = document.getElementById("resultado");
    if(out){
      out.textContent = JSON.stringify(data, null, 2);
    }
  } catch (e) {
    const out = document.getElementById("resultado");
    if(out){
      out.textContent = "Erro ao testar rota protegida";
    }
  }
}

window.onload = async () => {
  const btnEntrar = document.getElementById("btnEntrar");
  const btnTeste = document.getElementById("btnTeste");
  const senha = document.getElementById("senha");

  if(btnEntrar) btnEntrar.addEventListener("click", fazerLogin);
  if(btnTeste) btnTeste.addEventListener("click", testarAuth);
  if(senha) {
    senha.addEventListener("keydown", (e) => {
      if(e.key === "Enter") fazerLogin();
    });
  }

  const token = obterToken();
  if(!token) return;

  try {
    const res = await fetch("/api/auth/me", {
      headers: { "Authorization": "Bearer " + token }
    });
    const data = await res.json().catch(() => ({}));
    if(data.ok){
      const usuarioEl = document.getElementById("usuario");
      if(usuarioEl){
        usuarioEl.textContent = JSON.stringify(data.usuario, null, 2);
      }
      setStatus("Sessão restaurada");
    }
  } catch (e) {}
};
