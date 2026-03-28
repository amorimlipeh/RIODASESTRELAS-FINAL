function getData(){
  return JSON.parse(localStorage.getItem("estoque")||"[]");
}

function saveData(data){
  localStorage.setItem("estoque", JSON.stringify(data));
}

function render(){
  const lista = document.getElementById("lista");
  const data = getData();
  lista.innerHTML = data.map((i,idx)=>`<li>${i.produto} - ${i.qtd} <button onclick="remover(${idx})">X</button></li>`).join("");
}

function adicionar(){
  const produto = document.getElementById("produto").value;
  const qtd = document.getElementById("quantidade").value;

  if(!produto || !qtd) return alert("Preencha");

  const data = getData();
  data.push({produto, qtd});
  saveData(data);
  render();
}

function remover(i){
  const data = getData();
  data.splice(i,1);
  saveData(data);
  render();
}

function logout(){
  localStorage.clear();
  window.location="/login";
}

window.onload = ()=>{
  if(!localStorage.getItem("rio_token")){
    window.location="/login";
    return;
  }
  render();
}
