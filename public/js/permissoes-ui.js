
function getUser(){
  return JSON.parse(localStorage.getItem("usuario") || "{}");
}

function controlarUI(){
  const user = getUser();

  if(!user.tipo) return;

  if(user.tipo === "operador"){
    ocultar("dashboard");
    ocultar("usuarios");
  }

  if(user.tipo === "admin"){
    ocultar("usuarios");
  }
}

function ocultar(id){
  const el = document.getElementById(id);
  if(el) el.style.display = "none";
}

window.onload = controlarUI;
