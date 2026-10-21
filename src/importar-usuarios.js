
const fs = require("node:fs");
const path = require("node:path");
const bcrypt = require("bcryptjs");
const pool = require("./config/database");

const caminhoCSV = path.resolve(
  __dirname,
  "../../anexos/usuarios.csv"
);

const cabecalhoEsperado = [
  "nome",
  "nome_usuario",
  "email",
  "senha",
  "imagem_usuario",
  "tipo",
];

async function importarUsuarios() {
  let client;

  try {
    if (!fs.existsSync(caminhoCSV)) {
      throw new Error(`Arquivo CSV não encontrado: ${caminhoCSV}`);
    }

    const conteudo = fs
      .readFileSync(caminhoCSV, "utf8")
      .replace(/^\uFEFF/, "")
      .trim();

    const linhas = conteudo
      .split(/\r?\n/)
      .filter((linha) => linha.trim() !== "");

    if (linhas.length < 2) {
      throw new Error("O CSV não contém usuários para importar.");
    }

    const cabecalho = linhas[0]
      .split(",")
      .map((campo) => campo.trim());

    if (
      cabecalho.length !== cabecalhoEsperado.length ||
      !cabecalhoEsperado.every(
        (campo, indice) => cabecalho[indice] === campo
      )
    ) {
      throw new Error("O cabeçalho do CSV está diferente do esperado.");
    }

    const usuarios = linhas.slice(1).map((linha, indice) => {
      const campos = linha.split(",").map((campo) => campo.trim());

      if (campos.length !== cabecalhoEsperado.length) {
        throw new Error(
          `Quantidade de campos inválida na linha ${indice + 2}.`
        );
      }

      const [
        nome,
        nome_usuario,
        email,
        senha,
        imagem_usuario,
        tipo,
      ] = campos;

      if (
        !nome ||
        !nome_usuario ||
        !email ||
        !senha ||
        !imagem_usuario
      ) {
        throw new Error(`Campo obrigatório vazio na linha ${indice + 2}.`);
      }

      if (!/^[a-zA-Z0-9_]{3,50}$/.test(nome_usuario)) {
        throw new Error(
          `Nome de usuário inválido na linha ${indice + 2}.`
        );
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error(`E-mail inválido na linha ${indice + 2}.`);
      }

      if (!["usuario", "administrador"].includes(tipo)) {
        throw new Error(`Tipo de conta inválido na linha ${indice + 2}.`);
      }

      return {
        nome,
        nome_usuario,
        email,
        senha,
        imagem_usuario,
        tipo,
      };
    });

    // Evita duplicações dentro do próprio arquivo.
    const nomes = usuarios.map((u) => u.nome_usuario.toLowerCase());
    const emails = usuarios.map((u) => u.email.toLowerCase());

    if (new Set(nomes).size !== nomes.length) {
      throw new Error("Existem nomes de usuário duplicados no CSV.");
    }

    if (new Set(emails).size !== emails.length) {
      throw new Error("Existem e-mails duplicados no CSV.");
    }

    // Calcula os hashes antes de iniciar a transação.
    const usuariosComHash = await Promise.all(
      usuarios.map(async (usuario) => ({
        ...usuario,
        senha: await bcrypt.hash(usuario.senha, 12),
      }))
    );

    client = await pool.connect();
    await client.query("BEGIN");

    for (const usuario of usuariosComHash) {
      await client.query(
        `INSERT INTO tb_usuario (
          nome,
          nome_usuario,
          email,
          senha,
          imagem_usuario,
          tipo
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (nome_usuario)
        DO UPDATE SET
          nome = EXCLUDED.nome,
          email = EXCLUDED.email,
          senha = EXCLUDED.senha,
          imagem_usuario = EXCLUDED.imagem_usuario,
          tipo = EXCLUDED.tipo,
          updated_at = CURRENT_TIMESTAMP`,
        [
          usuario.nome,
          usuario.nome_usuario,
          usuario.email,
          usuario.senha,
          usuario.imagem_usuario,
          usuario.tipo,
        ]
      );
    }

    await client.query("COMMIT");

    console.log(`Importação concluída: ${usuarios.length} usuários processados.`);
    console.log("As senhas foram armazenadas usando hash bcrypt.");
  } catch (erro) {
    if (client) {
      await client.query("ROLLBACK").catch(() => {});
    }

    console.error("Falha na importação:", erro.message);
    process.exitCode = 1;
  } finally {
    client?.release();
    await pool.end();
  }
}

importarUsuarios();
