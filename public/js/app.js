
async function loadIA(){
 const r=await fetch("/api/ia");
 const d=await r.json();

 const a=document.getElementById("alertas");
 a.innerHTML="";
 d.alertas.forEach(x=>{
  const div=document.createElement("div");
  div.innerText="⚠️ "+x;
  a.appendChild(div);
 });

 const s=document.getElementById("sugestoes");
 s.innerHTML="";
 d.sugestoes.forEach(x=>{
  const div=document.createElement("div");
  div.innerText="💡 "+x;
  s.appendChild(div);
 });
}

setInterval(loadIA,3000);
window.onload=loadIA;
