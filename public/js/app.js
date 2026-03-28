function getKey(){return "estoque_"+CORE.getEmpresa()}
function getData(){return JSON.parse(localStorage.getItem(getKey())||"[]")}
function save(d){localStorage.setItem(getKey(),JSON.stringify(d))}
function add(){
const p=document.getElementById("produto").value
const q=document.getElementById("qtd").value
const d=getData(); d.push({p,q}); save(d); render()}
function render(){
CORE.validar()
document.getElementById("emp").innerText=CORE.getEmpresa()
document.getElementById("lista").innerHTML=
getData().map(x=>`<li>${x.p}-${x.q}</li>`).join("")}
render()