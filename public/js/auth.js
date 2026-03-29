document.addEventListener("DOMContentLoaded", function() {
  async function login() {
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const status = document.getElementById("status");
    status.innerText = "Entrando...";

    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ email, senha })
      });
      const d = await r.json();
      if (!r.ok || !d.ok) {
        status.innerText = d.erro || "Erro login";
        return;
      }

      localStorage.setItem("rio_token", d.token);
      localStorage.setItem("usuario", JSON.stringify(d.usuario));
      window.location.href = "/app";
    } catch (e) {
      status.innerText = "Erro conexão";
    }
  }

  document.getElementById("btnEntrar").onclick = login;
  document.getElementById("senha").addEventListener("keypress", function(e) {
    if (e.key === "Enter") login();
  });

  const token = localStorage.getItem("rio_token");
  if (token) window.location.href = "/app";
});
