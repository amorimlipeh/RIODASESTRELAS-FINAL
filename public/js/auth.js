
document.addEventListener("DOMContentLoaded", function(){

  function login(){
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const status = document.getElementById("status");
    if(status) status.innerText = "Entrando...";

    fetch("/api/auth/login", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({email, senha})
    })
    .then(r=>r.json())
    .then(data=>{
      if(!data.ok){
        if(status) status.innerText = "Erro login";
        return;
      }

      localStorage.setItem("rio_token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      window.location.href = "/app";
    })
    .catch(()=>{
      if(status) status.innerText = "Erro conexão";
    });
  }

  const btn = document.getElementById("btnEntrar");
  if(btn){
    btn.onclick = login;
  }

  const senha = document.getElementById("senha");
  if(senha){
    senha.addEventListener("keypress", function(e){
      if(e.key === "Enter") login();
    });
  }

  // auto login
  const token = localStorage.getItem("rio_token");
  if(token){
    window.location.href = "/app";
  }

});
