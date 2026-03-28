
CREATE TABLE empresas (
 id SERIAL PRIMARY KEY,
 nome TEXT
);

CREATE TABLE usuarios (
 id SERIAL PRIMARY KEY,
 empresa_id INT,
 email TEXT,
 senha TEXT
);

CREATE TABLE clientes (
 id SERIAL PRIMARY KEY,
 empresa_id INT,
 nome TEXT,
 plano TEXT,
 ativo BOOLEAN
);

CREATE TABLE pagamentos (
 id SERIAL PRIMARY KEY,
 cliente_id INT,
 valor NUMERIC,
 data TIMESTAMP
);
