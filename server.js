const express = require("express");
const path = require("path");
const multer = require("multer");
const XLSX = require("xlsx");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const upload = multer({ dest: path.join(__dirname, "uploads") });

let estoque = [];
let pedidos = [];

function normalizarEndereco(endereco) {
  if (!endereco) return null;
  const limpo = String(endereco).replace(/\D/g, "");
  if (limpo.length !== 7) return null;
  return `${limpo.slice(0, 2)}-${limpo.slice(2, 5)}-${limpo.slice(5, 6)}-${limpo.slice(6, 7)}`;
}

function procurarEstoque(codigo, endereco) {
  return estoque.find((i) => i.codigo === codigo && i.endereco === endereco);
}

app.get("/api/status", (req, res) => {
  res.json({
    ok: true,
    sistema: "RIO DAS ESTRELAS",
    status: "online"
  });
});

app.post("/api/estoque/entrada", (req, res) => {
  const { codigo, endereco, quantidade } = req.body || {};
  const end = normalizarEndereco(endereco);

  if (!codigo || !end) {
    return res.status(400).json({ ok: false, erro: "Código ou endereço inválido" });
  }

  let item = procurarEstoque(String(codigo), end);
  if (!item) {
    item = {
      codigo: String(codigo),
      endereco: end,
      quantidade: 0,
      reservado: 0
    };
    estoque.push(item);
  }

  item.quantidade += Number(quantidade || 0);
  res.json({ ok: true, item });
});

app.get("/api/estoque", (req, res) => {
  res.json({ ok: true, estoque });
});

app.post("/api/importar", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, erro: "Arquivo não enviado" });
    }

    const wb = XLSX.readFile(req.file.path);
    const nomeAba = wb.SheetNames[0];
    const sheet = wb.Sheets[nomeAba];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    const preview = rows.slice(0, 20);
    let importados = 0;

    rows.forEach((row) => {
      const codigo = String(
        row.codigo ||
        row.Codigo ||
        row["Código"] ||
        row["Código do Produto"] ||
        ""
      ).trim();

      const quantidade = Number(
        row.quantidade ||
        row.Quantidade ||
        row["Estoque (UN)"] ||
        row.qtd ||
        0
      );

      const enderecoRaw =
        row.endereco ||
        row.Endereco ||
        row["Endereço"] ||
        row["Endereco"] ||
        "0100101";

      const endereco = normalizarEndereco(enderecoRaw);

      if (!codigo || !endereco) return;

      let item = procurarEstoque(codigo, endereco);
      if (!item) {
        item = { codigo, endereco, quantidade: 0, reservado: 0 };
        estoque.push(item);
      }
      item.quantidade += quantidade;
      importados += 1;
    });

    res.json({
      ok: true,
      aba: nomeAba,
      totalLinhas: rows.length,
      importados,
      preview
    });
  } catch (e) {
    res.status(500).json({ ok: false, erro: e.message });
  }
});

app.get("/api/wms/grid", (req, res) => {
  const grid = {};

  for (let r = 1; r <= 7; r++) {
    const rua = String(r).padStart(2, "0");
    grid[rua] = {};

    for (let a = 1; a <= 7; a++) {
      grid[rua][a] = {};

      for (let p = 1; p <= 140; p++) {
        const pos = String(p).padStart(3, "0");
        const endereco = `${rua}-${pos}-${a}-1`;
        const item = estoque.find((e) => e.endereco === endereco);

        let status = "vazio";
        if (item) {
          status = item.reservado > 0 ? "reservado" : "ocupado";
        }

        grid[rua][a][pos] = {
          status,
          produto: item?.codigo || "",
          quantidade: item?.quantidade || 0
        };
      }
    }
  }

  res.json({ ok: true, grid });
});

app.post("/api/pedido", (req, res) => {
  const pedido = {
    id: Date.now(),
    status: "pendente",
    itens: Array.isArray(req.body?.itens) ? req.body.itens : []
  };
  pedidos.push(pedido);
  res.json({ ok: true, pedido });
});

app.get("/api/pedidos", (req, res) => {
  res.json({ ok: true, pedidos });
});

app.post("/api/picking/:id", (req, res) => {
  const pedido = pedidos.find((p) => String(p.id) === String(req.params.id));
  if (!pedido) {
    return res.status(404).json({ ok: false, erro: "Pedido não encontrado" });
  }

  pedido.itens.forEach((itemPedido) => {
    let restante = Number(itemPedido.quantidade || 0);

    estoque.forEach((itemEstoque) => {
      const disponivel = Number(itemEstoque.quantidade || 0) - Number(itemEstoque.reservado || 0);
      if (itemEstoque.codigo === itemPedido.codigo && restante > 0 && disponivel > 0) {
        const usar = Math.min(disponivel, restante);
        itemEstoque.reservado += usar;
        restante -= usar;
      }
    });

    itemPedido.falta = restante;
  });

  pedido.status = "separacao";
  res.json({ ok: true, pedido });
});

app.listen(PORT, () => {
  console.log("Base consolidada rodando na porta " + PORT);
});
