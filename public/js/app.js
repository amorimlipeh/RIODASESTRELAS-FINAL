
const $ = (s)=>document.querySelector(s);
const $$ = (s)=>Array.from(document.querySelectorAll(s));

function setView(v){
  $$(".menu-item").forEach(el=>el.classList.toggle("active", el.dataset.view===v));
  $$(".view").forEach(el=>el.classList.toggle("active", el.id==="view-"+v));
}

async function getJSON(url, opts={}){
  const r = await fetch(url, { headers:{ "Content-Type":"application/json" }, ...opts });
  return r.json();
}

async function loadResumo(){
  const d = await getJSON("/api/resumo");
  if(!d.ok) return;
  $("#kpi-clientes").innerText = d.totalClientes;
  $("#kpi-receita").innerText = "R$ " + d.receita;
  $("#kpi-atrasados").innerText = d.atrasados;
}

function badge(status){
  const s = status;
  return `<span class="badge ${s}">${s}</span>`;
}

async function loadClientes(){
  const d = await getJSON("/api/clientes");
  if(!d.ok) return;
  const tb = $("#tbody-clientes");
  tb.innerHTML = "";
  const filtro = ($("#filtro").value||"").toUpperCase();

  d.clientes
    .filter(c=>!filtro || c.empresa.includes(filtro))
    .forEach(c=>{
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.empresa}</td>
        <td>${c.plano}</td>
        <td>R$ ${c.valor}</td>
        <td>${new Date(c.vencimento).toLocaleDateString()}</td>
        <td>${badge(c.statusCalc)}</td>
        <td>
          <button data-id="${c.id}" class="btn-edit">Editar</button>
          <button data-id="${c.id}" class="btn-del">Excluir</button>
        </td>
      `;
      tb.appendChild(tr);
    });

  // bind actions
  $$(".btn-del").forEach(btn=>{
    btn.onclick = async ()=>{
      if(!confirm("Excluir cliente?")) return;
      await fetch("/api/clientes/"+btn.dataset.id, { method:"DELETE" });
      await loadClientes();
      await loadResumo();
    };
  });

  $$(".btn-edit").forEach(btn=>{
    btn.onclick = async ()=>{
      const id = Number(btn.dataset.id);
      const empresa = prompt("Empresa:");
      const plano = prompt("Plano (basico/profissional/enterprise):");
      const valor = prompt("Valor:");
      const venc = prompt("Vencimento (YYYY-MM-DD):");
      const status = prompt("Status (ativo/bloqueado):");
      const mods = prompt("Módulos (csv):");
      await fetch("/api/clientes/"+id, {
        method:"PUT",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          empresa, plano, valor, vencimento: venc, status,
          modulos: (mods||"").split(",").map(x=>x.trim()).filter(Boolean)
        })
      });
      await loadClientes();
      await loadResumo();
    };
  });
}

function openModal(){ $("#modal").classList.remove("hidden"); }
function closeModal(){ $("#modal").classList.add("hidden"); }

async function criarCliente(){
  const empresa = $("#m-empresa").value;
  const plano = $("#m-plano").value;
  const valor = $("#m-valor").value;
  const venc = $("#m-venc").value;
  const mods = $("#m-mods").value.split(",").map(x=>x.trim()).filter(Boolean);

  const body = {
    empresa, plano, valor,
    vencimento: venc ? new Date(venc).toISOString() : undefined,
    modulos: mods
  };
  await fetch("/api/clientes", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify(body)
  });
  closeModal();
  await loadClientes();
  await loadResumo();
}

async function bloquearAtrasados(){
  const d = await getJSON("/api/rotina/bloquear-atrasados", { method:"POST" });
  alert("Bloqueados: " + (d.bloqueados||0));
  await loadClientes();
  await loadResumo();
}

async function registrarPagamento(){
  const id = Number($("#pag-id").value);
  const dias = Number($("#pag-dias").value || 30);
  const d = await getJSON("/api/pagamento", {
    method:"POST",
    body: JSON.stringify({ id, dias })
  });
  $("#out-pag").innerText = JSON.stringify(d, null, 2);
  await loadClientes();
  await loadResumo();
}

async function salvarMods(){
  const id = Number($("#cfg-id").value);
  const mods = $("#cfg-mods").value.split(",").map(x=>x.trim()).filter(Boolean);
  const d = await getJSON("/api/clientes/"+id, {
    method:"PUT",
    body: JSON.stringify({ modulos: mods })
  });
  $("#out-cfg").innerText = JSON.stringify(d, null, 2);
  await loadClientes();
}

// events
$$(".menu-item").forEach(el=>{
  el.onclick = ()=> setView(el.dataset.view);
});

$("#btn-novo").onclick = openModal;
$("#m-cancelar").onclick = closeModal;
$("#m-salvar").onclick = criarCliente;
$("#btn-bloquear").onclick = bloquearAtrasados;
$("#btn-pagar").onclick = registrarPagamento;
$("#btn-salvar-mods").onclick = salvarMods;
$("#filtro").oninput = loadClientes;

// init
window.onload = async ()=>{
  setView("dashboard");
  await loadResumo();
  await loadClientes();
};
