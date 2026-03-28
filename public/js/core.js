const CORE={
getEmpresa(){return localStorage.getItem("empresa_atual")||""},
getToken(){return localStorage.getItem("rio_token")||""},
validar(){
if(!this.getEmpresa()||!this.getToken()){
localStorage.clear();
window.location="/login";
}}};