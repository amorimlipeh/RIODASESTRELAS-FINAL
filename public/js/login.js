function getEmpresas(){
return JSON.parse(localStorage.getItem("empresas")||"[]")}
function render(){
document.getElementById("empresa").innerHTML=
getEmpresas().map(e=>`<option>${e.nome}</option>`).join("")}
function login(){
const emp=document.getElementById("empresa").value
const e=getEmpresas().find(x=>x.nome===emp)
if(!e)return alert("Empresa não existe")
if(e.status==="bloqueado")return alert("Empresa bloqueada")
localStorage.setItem("empresa_atual",emp)
localStorage.setItem("rio_token","ok")
window.location="/app"}
render()