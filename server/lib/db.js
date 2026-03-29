const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "..", "data", "db.json");

function ensureDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({
      users: [], companies: [], produtos: [], estoque: [], pedidos: [], logs: []
    }, null, 2));
  }
}

function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function appendLog(action, meta = {}) {
  const db = readDb();
  db.logs.unshift({
    id: Date.now() + Math.floor(Math.random() * 1000),
    action,
    meta,
    em: new Date().toISOString()
  });
  db.logs = db.logs.slice(0, 200);
  writeDb(db);
}

module.exports = { readDb, writeDb, appendLog };
