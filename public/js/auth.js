
(function(){
  function getToken(){
    return localStorage.getItem("rio_token") || "";
  }

  function isLoginPage(){
    const p = window.location.pathname || "/";
    return p === "/" || p === "/login" || p.endsWith("login.html");
  }

  function goApp(){
    if (window.location.pathname !== "/app") {
      window.location.replace("/app");
    }
  }

  function setStatus(text, erro){
    const el = document.getElementById("status");
    if(!el) return;
    el.textContent = text || "";
    el.style.color = erro ? "#ff8f8f" : "#9ee6a8";
  }

  function salvarSessao(token, usuario){
    localStorage.setItem("rio_token", token);
    if (usuario) localStorage.setItem("usuario", JSON.stringify(usuario));
  }

  async function login(){
    const email = document.getElementById("email")?.value || "";
    const senha = document.getElementById("senha")?.value || "";

    setStatus("Entrando...");

    try {
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
      setStatus("Login OK. Entrando...");
      setTimeout(goApp, 400);

    } catch(e){
      setStatus("Falha de conexão", true);
    }
  }

  function bind(){
    const btn = document.getElementById("btnEntrar");
    const senha = document.getElementById("senha");
    if(btn) btn.onclick = login;
    if(senha){
      senha.addEventListener("keydown", (e)=>{
        if(e.key === "Enter") login();
      });
    }
  }

  // 🔥 AUTOLOGIN FORÇADO
  function auto(){
    const token = getToken();
    if(token){
      // se estiver em qualquer página de login/raiz → vai pro app
      if (isLoginPage()) {
        goApp();
        return;
      }
    }
  }

  window.addEventListener("load", function(){
    bind();
    auto();
  });
})();
