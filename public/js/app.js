
function getEmpresa(){
  return localStorage.getItem("empresa_atual") || "";
}

function getKey(){
  return "estoque_" + getEmpresa();
}

function getData(){
  return JSON.parse(localStorage.getItem(getKey()) || "[]");
}

function save(data){
  localStorage.setItem(getKey(), JSON.stringify(data));
}

function add(){
  const p = document.getElementById("produto").value.trim();
  const q = parseInt(document.getElementById("qtd").value);

  if(!p || !q) return;

  let data = getData();
  const existente = data.find(i => i.p === p);

  if(existente){
    existente.q += q;
  } else {
    data.push({ p, q });
  }

  save(data);
  render();
}

function editar(index){
  let data = getData();
  let novo = prompt("Nova quantidade:", data[index].q);
  if(novo !== null){
    data[index].q = parseInt(novo);
    save(data);
    render();
  }
}

function remover(index){
  let data = getData();
  data.splice(index,1);
  save(data);
  render();
}

function render(){
  const emp = getEmpresa();
  if(!emp){
    window.location="/login";
    return;
  }

  document.getElementById("emp").innerText = emp;

  let data = getData();
  document.getElementById("lista").innerHTML =
    data.map((i,idx)=>`
      <li>
        ${i.p} - ${i.q}
        <button onclick="editar(${idx})">✏️</button>
        <button onclick="remover(${idx})">❌</button>
      </li>
    `).join("");
}

render();
