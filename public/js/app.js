
async function load(){
 const r=await fetch("/api/wms");
 const d=await r.json();

 const el=document.getElementById("mapa");
 el.innerHTML="";

 Object.keys(d.grid).forEach(rua=>{
  const div=document.createElement("div");
  div.innerHTML="<h3>Rua "+rua+"</h3>";

  Object.keys(d.grid[rua]).forEach(p=>{
   const c=d.grid[rua][p];

   const box=document.createElement("div");
   box.style.display="inline-block";
   box.style.width="60px";
   box.style.margin="2px";

   if(c.status==="bloqueado") box.style.background="red";
   else if(c.status==="ocupado") box.style.background="green";
   else box.style.background="gray";

   box.innerText=p;
   div.appendChild(box);
  });

  el.appendChild(div);
 });
}

window.onload=load;
