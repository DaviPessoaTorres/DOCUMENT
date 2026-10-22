
const express = require("express");
const pool = require("../config/database");

const router = express.Router();

const { exigirLogin } = require("../middleware/autenticacao");

// Lista os filmes e a quantidade de curtidas de cada um.
router.get("/", async (req, res) => {
  const busca = String(req.query.busca || "").trim();
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
      WHERE (
        $1 = ''
        OR f.titulo_filme ILIKE '%' || $1 || '%'
        OR f.genero ILIKE '%' || $1 || '%'
      )
      GROUP BY
        f.id_filme,
        f.titulo_filme,
        f.genero,
        f.url_capa,
        u.nome_usuario
            ORDER BY f.id_filme;
    `, [busca]);

    return res.json({ filmes: resultado.rows });
  } catch (erro) {
    console.error("Erro ao listar filmes:", erro.message);

    return res.status(500).json({
      erro: "Não foi possível carregar os filmes.",
    });
  }
});

// Curte ou remove a curtida de um filme.
router.post("/:id/curtida", exigirLogin, async (req, res) => {
  const idFilme = Number(req.params.id);
  const idUsuario = req.session.usuario.id_usuario;

  if (!Number.isInteger(idFilme) || idFilme <= 0) {
    return res.status(400).json({
      erro: "ID de filme inválido.",
    });
  }

  try {
    // Se a curtida não existir, registra.
    const insercao = await pool.query(
      `INSERT INTO tb_curtida (id_usuario, id_filme)
       VALUES ($1, $2)
       ON CONFLICT (id_usuario, id_filme) DO NOTHING
       RETURNING id_curtida`,
      [idUsuario, idFilme]
    );

    if (insercao.rowCount > 0) {
      return res.json({
        mensagem: "Filme curtido.",
        curtido: true,
      });
    }

    // Se já existir, remove a curtida.
    const remocao = await pool.query(
      `DELETE FROM tb_curtida
       WHERE id_usuario = $1 AND id_filme = $2
       RETURNING id_curtida`,
      [idUsuario, idFilme]
    );

    return res.json({
      mensagem: "Curtida removida.",
      curtido: false,
    });
  } catch (erro) {
    console.error("Erro ao alternar curtida:", erro.message);

    return res.status(500).json({
      erro: "Não foi possível registrar a curtida.",
    });
  }
});

module.exports = router;
