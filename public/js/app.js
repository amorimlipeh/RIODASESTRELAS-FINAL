function getProdutos(){
  return JSON.parse(localStorage.getItem("produtos")||"[]");
}
function saveProdutos(p){
  localStorage.setItem("produtos", JSON.stringify(p));
}

function getEstoque(){
  return JSON.parse(localStorage.getItem("estoque")||"[]");
}
function saveEstoque(e){
  localStorage.setItem("estoque", JSON.stringify(e));
}

function salvarProduto(){
  const codigo=document.getElementById("codigo").value;
  const nome=document.getElementById("nome").value;
  const fator=document.getElementById("fator").value;

  if(!codigo||!nome) return alert("Preencha");

  const produtos=getProdutos();
  produtos.push({codigo,nome,fator});
  saveProdutos(produtos);

  renderProdutos();
  renderSelect();
}

function renderProdutos(){
  const el=document.getElementById("produtos");
  const produtos=getProdutos();
  el.innerHTML=produtos.map(p=>`<li>${p.codigo} - ${p.nome}</li>`).join("");
}

function renderSelect(){
  const sel=document.getElementById("produtoSelect");
  const produtos=getProdutos();
  sel.innerHTML=produtos.map((p,i)=>`<option value="${i}">${p.nome}</option>`).join("");
}

function movimentar(){
  const idx=document.getElementById("produtoSelect").value;
  const qtd=document.getElementById("quantidade").value;

  const produtos=getProdutos();
  const estoque=getEstoque();

  const prod=produtos[idx];
  if(!prod) return;

  estoque.push({produto:prod.nome,qtd});
  saveEstoque(estoque);

  renderEstoque();
}

function renderEstoque(){
  const el=document.getElementById("estoque");
  const estoque=getEstoque();
  el.innerHTML=estoque.map(e=>`<li>${e.produto} - ${e.qtd}</li>`).join("");
}

function logout(){
  localStorage.clear();
  window.location="/login";
}

window.onload=()=>{
  if(!localStorage.getItem("rio_token")){
    window.location="/login";
    return;
  }
  renderProdutos();
  renderSelect();
  renderEstoque();
}
