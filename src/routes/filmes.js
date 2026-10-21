
const express = require("express");
const pool = require("../config/database");

const router = express.Router();

// Lista os filmes e a quantidade de curtidas de cada um.
router.get("/", async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT
        f.id_filme,
        f.titulo_filme,
        f.genero,
        f.url_capa,
        u.nome_usuario AS administrador,
        COUNT(c.id_curtida)::INTEGER AS total_curtidas
      FROM tb_filme f
      JOIN tb_usuario u
        ON u.id_usuario = f.id_usuario
      LEFT JOIN tb_curtida c
        ON c.id_filme = f.id_filme
      GROUP BY
        f.id_filme,
        f.titulo_filme,
        f.genero,
        f.url_capa,
        u.nome_usuario
      ORDER BY f.id_filme;
    `);

    return res.json({ filmes: resultado.rows });
  } catch (erro) {
    console.error("Erro ao listar filmes:", erro.message);

    return res.status(500).json({
      erro: "Não foi possível carregar os filmes.",
    });
  }
});

module.exports = router;
