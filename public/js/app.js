
async function migrar(){
  const r = await fetch('/api/migracao/legado', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ file:'data/legado.json' })
  });
  const d = await r.json();
  document.getElementById('out').textContent = JSON.stringify(d, null, 2);
}

async function listar(){
  const r = await fetch('/api/clientes');
  const d = await r.json();
  document.getElementById('out').textContent = JSON.stringify(d, null, 2);
}
