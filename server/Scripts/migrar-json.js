
require("dotenv").config();
const path = require("path");
const { migrarArquivoLegado } = require("../services/migrationService");

(async ()=>{
  try{
    const file = path.join(process.cwd(), "data", "legado.json");
    const result = await migrarArquivoLegado(file);
    console.log("Migração concluída:", result);
    process.exit(0);
  }catch(e){
    console.error("Erro na migração:", e.message);
    process.exit(1);
  }
})();
