async function testar() {
  const res = await fetch("/api/status");
  const data = await res.json();

  document.getElementById("status").innerText =
    data.sistema + " - " + data.status;
}
