
function mostrar(id){
  document.querySelectorAll('.modulo').forEach(m=>m.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// ajuste render wms id
function render(){
  const emp = getEmpresa();
  document.getElementById("emp").innerText = emp;

  let est = getData("estoque");
  document.getElementById("lista").innerHTML =
    est.map(i=>`<li>${i.p} - ${i.q}</li>`).join("");

  let w = getData("wms");
  document.getElementById("wms_lista").innerHTML =
    w.map((e,i)=>`
      <li>${e.endereco} → ${e.produto || "vazio"} (${e.qtd})</li>
    `).join("");

  let pedidos = getData("pedidos");
  document.getElementById("pedidos").innerHTML =
    pedidos.map(p=>`<li>${p.produto} (${p.qtd}) - ${p.status}</li>`).join("");
}
