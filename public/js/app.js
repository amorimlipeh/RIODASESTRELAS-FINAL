async function carregarWMS(){
  const res = await fetch("/api/wms");
  const data = await res.json();

  const el = document.getElementById("wms");
  el.innerHTML="";

  Object.keys(data.grid).forEach(rua=>{
    const rDiv=document.createElement("div");
    rDiv.innerHTML="<h3>Rua "+rua+"</h3>";

    Object.keys(data.grid[rua]).forEach(pos=>{
      const c=data.grid[rua][pos];

      const div=document.createElement("div");
      div.style.display="inline-block";
      div.style.width="60px";
      div.style.margin="2px";
      div.style.background=c.ocupado?"green":"gray";

      div.innerText=pos;
      rDiv.appendChild(div);
    });

    el.appendChild(rDiv);
  });
}

window.onload=carregarWMS;
