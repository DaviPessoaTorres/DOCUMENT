
require("dotenv").config();

const express = require("express");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("node:path");
const pool = require("./config/database");
const autenticacaoRoutes = require("./routes/autenticacao");
const filmesRoutes = require("./routes/filmes");

if (!process.env.DATABASE_URL || !process.env.SESSION_SECRET) {
  throw new Error("Configure DATABASE_URL e SESSION_SECRET no arquivo .env.");
}

if (process.env.SESSION_SECRET.length < 32) {
  throw new Error("SESSION_SECRET precisa ter pelo menos 32 caracteres.");
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: false, limit: "20kb" }));

app.use(
  session({
    name: "streamflix.sid",
    store: new pgSession({
      pool,
      tableName: "user_sessions",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 8,
    },
  })
);

app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { erro: "Muitas tentativas. Tente novamente mais tarde." },
  }),
  autenticacaoRoutes
);

app.use("/api/filmes", filmesRoutes);

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", banco: "conectado" });
  } catch {
    res.status(503).json({
      status: "erro",
      banco: "indisponível",
    });
  }
});

// Os arquivos públicos serão servidos nesta pasta.
app.use(express.static(path.join(__dirname, "../public")));


const pastaOriginal = path.resolve(__dirname, "../../");

app.use(
  "/imagens",
  express.static(path.join(pastaOriginal, "imagens"))
);

app.use(
  "/icons",
  express.static(path.join(pastaOriginal, "icons"))
);


app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada." });
});

const servidor = app.listen(PORT, () => {
  console.log(`StreamFlix rodando em http://localhost:${PORT}`);
});

async function encerrar() {
  servidor.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on("SIGINT", encerrar);
process.on("SIGTERM", encerrar);
