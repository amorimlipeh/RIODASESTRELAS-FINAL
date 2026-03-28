async function login(){
 const email=document.getElementById("email").value;
 const senha=document.getElementById("senha").value;

 const res=await fetch("/api/auth/login",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({email,senha})
 });

 const data=await res.json();
 if(data.token){
  localStorage.setItem("rio_token",data.token);
  window.location.href="/app";
 } else {
  alert("Erro login");
 }
}

window.onload=()=>{
 if(localStorage.getItem("rio_token")){
  window.location.href="/app";
 }
}
