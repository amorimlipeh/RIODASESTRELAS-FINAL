function getEmpresas(){
  return JSON.parse(localStorage.getItem("empresas") || "[]");
}

function saveEmpresas(lista){
  localStorage.setItem("empresas", JSON.stringify(lista));
}

function setMsg(texto, erro=false){
  const el = document.getElementById("msg");
  if(!el) return;
  el.textContent = texto || "";
  el.style.color = erro ? "#ff8f8f" : "#9ee6a8";
}

function normalizarNome(nome){
  return String(nome || "").trim();
}

function empresaExiste(nome){
  const empresas = getEmpresas();
  return empresas.some(e => e.nome.toLowerCase() === nome.toLowerCase());
}

function cadastrarEmpresa(){
  const inputEmpresa = document.getElementById("empresa");
  const selectStatus = document.getElementById("status");

  const nome = normalizarNome(inputEmpresa.value);
  const status = selectStatus.value;

  if(!nome){
    setMsg("Digite o nome da empresa.", true);
    return;
  }

  if(empresaExiste(nome)){
    setMsg("Essa empresa já existe.", true);
    return;
  }

  const empresas = getEmpresas();
  empresas.push({ nome, status });
  saveEmpresas(empresas);

  inputEmpresa.value = "";
  selectStatus.value = "ativo";

  render();
  setMsg("Empresa cadastrada com sucesso.");
}

function alternarStatus(index){
  const empresas = getEmpresas();
  if(!empresas[index]) return;

  empresas[index].status = empresas[index].status === "ativo" ? "bloqueado" : "ativo";
  saveEmpresas(empresas);
  render();
  setMsg("Status alterado com sucesso.");
}

function excluirEmpresa(index){
  const empresas = getEmpresas();
  if(!empresas[index]) return;

  empresas.splice(index, 1);
  saveEmpresas(empresas);
  render();
  setMsg("Empresa excluída com sucesso.");
}

function render(){
  const ul = document.getElementById("empresas");
  const empresas = getEmpresas();

  if(!empresas.length){
    ul.innerHTML = "<li>Nenhuma empresa cadastrada.</li>";
    return;
  }

  ul.innerHTML = empresas.map((empresa, index) => `
    <li>
      <div class="item">
        <strong>${empresa.nome}</strong>
        <span class="status ${empresa.status}">${empresa.status}</span>
        <button class="small" onclick="alternarStatus(${index})">Alterar status</button>
        <button class="small" onclick="excluirEmpresa(${index})">Excluir</button>
      </div>
    </li>
  `).join("");
}

document.addEventListener("DOMContentLoaded", function(){
  const btn = document.getElementById("btnCadastrar");
  if(btn){
    btn.addEventListener("click", cadastrarEmpresa);
  }

  const inputEmpresa = document.getElementById("empresa");
  if(inputEmpresa){
    inputEmpresa.addEventListener("keydown", function(e){
      if(e.key === "Enter"){
        cadastrarEmpresa();
      }
    });
  }

  render();
});
