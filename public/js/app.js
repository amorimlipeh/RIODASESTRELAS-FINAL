async function importar(){
 const file = document.getElementById("file").files[0];

 const fd = new FormData();
 fd.append("file", file);

 const res = await fetch("/api/importar",{
  method:"POST",
  body:fd
 });

 const data = await res.json();

 const el = document.getElementById("preview");
 el.innerHTML = "";

 if(!data.ok){
  el.innerText = data.erro;
  return;
 }

 el.innerHTML = "<b>Total:</b> "+data.total+"<br><br>";

 data.preview.forEach(l=>{
  const div = document.createElement("div");
  div.innerText = JSON.stringify(l);
  el.appendChild(div);
 });
}
