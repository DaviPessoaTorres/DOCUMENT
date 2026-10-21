
const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../config/database");
const { exigirLogin } = require("../middleware/autenticacao");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const nomeUsuario = req.body.nome_usuario;
    const senha = req.body.senha;

    if (
      typeof nomeUsuario !== "string" ||
      typeof senha !== "string" ||
      nomeUsuario.length < 3 ||
      nomeUsuario.length > 50 ||
      senha.length === 0 ||
      senha.length > 200
    ) {
      return res.status(400).json({
        erro: "Informe um usuário e uma senha válidos.",
      });
    }

    const resultado = await pool.query(
      `SELECT id_usuario, nome, nome_usuario, email,
              senha, imagem_usuario, tipo
       FROM tb_usuario
       WHERE nome_usuario = $1
       LIMIT 1`,
      [nomeUsuario.trim()]
    );

    const usuario = resultado.rows[0];

    if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
      return res.status(401).json({
        erro: "Usuário não encontrado ou senha incorreta.",
      });
    }

    // Troca o identificador da sessão após autenticar.
    req.session.regenerate((erro) => {
      if (erro) {
        return res.status(500).json({
          erro: "Não foi possível iniciar a sessão.",
        });
      }

      req.session.usuario = {
        id_usuario: usuario.id_usuario,
        nome: usuario.nome,
        nome_usuario: usuario.nome_usuario,
        email: usuario.email,
        imagem_usuario: usuario.imagem_usuario,
        tipo: usuario.tipo,
      };

      req.session.save((erroAoSalvar) => {
        if (erroAoSalvar) {
          return res.status(500).json({
            erro: "Não foi possível salvar a sessão.",
          });
        }

        return res.json({
          mensagem: "Login realizado com sucesso.",
          usuario: req.session.usuario,
        });
      });
    });
  } catch (erro) {
    console.error("Erro no login:", erro.message);

    res.status(500).json({
      erro: "Erro interno ao realizar login.",
    });
  }
});

router.get("/me", exigirLogin, (req, res) => {
  res.json({ usuario: req.session.usuario });
});

router.post("/logout", exigirLogin, (req, res) => {
  req.session.destroy((erro) => {
    if (erro) {
      return res.status(500).json({
        erro: "Não foi possível encerrar a sessão.",
      });
    }

    res.clearCookie("streamflix.sid");
    return res.json({ mensagem: "Logout realizado com sucesso." });
  });
});

module.exports = router;
