
async function startCamera(){
 const video=document.getElementById("video");
 const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});
 video.srcObject=stream;

 setInterval(()=>{
  fakeScan();
 },3000);
}

// simulação reconhecimento (base para IA real)
function fakeScan(){
 const codigos=["A123","B456","C789"];
 const cod=codigos[Math.floor(Math.random()*codigos.length)];

 document.getElementById("result").innerText="Detectado: "+cod;
}
