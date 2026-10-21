
const pool = require("./config/database");

async function testarConexao() {
  try {
    const resultado = await pool.query(`
      SELECT
        current_user AS usuario,
        current_database() AS banco,
        inet_server_port() AS porta
    `);

    console.log("Conexão com PostgreSQL realizada!");
    console.table(resultado.rows);
  } catch (erro) {
    console.error("Falha na conexão:", erro.message);
  } finally {
    await pool.end();
  }
}

testarConexao();
