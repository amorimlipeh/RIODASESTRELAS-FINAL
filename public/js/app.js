async function load(){
  const res = await fetch("/api/wms");
  const data = await res.json();

  const el = document.getElementById("wms");
  el.innerHTML="";

  Object.keys(data.grid).forEach(rua=>{
    const r=document.createElement("div");
    r.innerHTML="<h2>Rua "+rua+"</h2>";

    Object.keys(data.grid[rua]).forEach(a=>{
      const ad=document.createElement("div");
      ad.innerHTML="<b>Andar "+a+"</b>";
      ad.style.display="flex";
      ad.style.flexWrap="wrap";

      Object.keys(data.grid[rua][a]).forEach(p=>{
        const c=data.grid[rua][a][p];

        const d=document.createElement("div");
        d.style.width="40px";
        d.style.height="25px";
        d.style.margin="2px";
        d.style.background=c.ocupado?"green":"gray";
        d.innerText=p;

        ad.appendChild(d);
      });

      r.appendChild(ad);
    });

    el.appendChild(r);
  });
}

window.onload=load;
