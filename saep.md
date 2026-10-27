
# ARQUIVO: .env.example

```

PORT=3000
DATABASE_URL=postgresql://USUARIO:SENHA@localhost:5432/streamflix
SESSION_SECRET=troque-por-um-segredo-aleatorio-longo

```

# ARQUIVO: .gitignore

```

node_modules/
.env
.env.*
!.env.example
public/uploads/*
!public/uploads/.gitkeep
npm-debug.log*

```

# ARQUIVO: backup\app.js

```

const galeria = document.querySelector("#galeria");
const statusCatalogo = document.querySelector("#statusCatalogo");
const mensagem = document.querySelector("#mensagem");
const formBusca = document.querySelector("#formBusca");
const campoBusca = document.querySelector("#campoBusca");

function mostrarMensagem(texto) {
  mensagem.textContent = texto;
  mensagem.hidden = !texto;
}

function criarFilme(filme) {
  const artigo = document.createElement("article");
  artigo.className = "filme";

  const containerCapa = document.createElement("div");
  containerCapa.className = "capa-container";

  const imagem = document.createElement("img");
  imagem.className = "capa";
  imagem.src = filme.url_capa;
  imagem.alt = `Capa de ${filme.titulo_filme}`;
  imagem.loading = "lazy";
  imagem.onerror = () => {
    imagem.alt = "Capa indisponÃ­vel";
    imagem.removeAttribute("src");
  };

  const detalhes = document.createElement("div");
  detalhes.className = "detalhes-capa";

  const administrador = document.createElement("p");
  administrador.textContent = `Cadastrado por: @${filme.administrador}`;

  const genero = document.createElement("p");
  genero.textContent = filme.genero;

  detalhes.append(administrador, genero);
  containerCapa.append(imagem, detalhes);

  const titulo = document.createElement("h3");
  titulo.textContent = filme.titulo_filme;

  const rodape = document.createElement("div");
  rodape.className = "filme-rodape";

  const textoCurtidas = document.createElement("span");
  textoCurtidas.className = "curtidas";

  const icone = document.createElement("img");
  icone.src = "/icons/coracao.svg";
  icone.alt = "";

  const quantidade = document.createElement("span");
  quantidade.textContent = String(filme.total_curtidas);

  textoCurtidas.append(icone, quantidade);
  rodape.append(textoCurtidas);

  artigo.append(containerCapa, titulo, rodape);

  return artigo;
}

async function carregarFilmes() {
  galeria.replaceChildren();
  statusCatalogo.textContent = "Carregando filmes...";
  mostrarMensagem("");

  try {
    const resposta = await fetch("/api/filmes");

    if (!resposta.ok) {
      throw new Error("Falha ao consultar a API.");
    }

    const dados = await resposta.json();

    if (!Array.isArray(dados.filmes)) {
      throw new Error("Formato de resposta invÃ¡lido.");
    }

    if (dados.filmes.length === 0) {
      statusCatalogo.textContent = "Nenhum filme cadastrado.";
      return;
    }

    const fragmento = document.createDocumentFragment();

    for (const filme of dados.filmes) {
      fragmento.append(criarFilme(filme));
    }

    galeria.append(fragmento);
    statusCatalogo.textContent =
      `${dados.filmes.length} filme(s) no catÃ¡logo`;
  } catch (erro) {
    console.error("Erro ao carregar o catÃ¡logo:", erro);
    statusCatalogo.textContent = "NÃ£o foi possÃ­vel carregar o catÃ¡logo.";
    mostrarMensagem("Verifique a conexÃ£o com o servidor e tente novamente.");
  }
}

formBusca.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const busca = campoBusca.value.trim();

  if (!busca) {
    mostrarMensagem("Digite o nome de um administrador para pesquisar.");
    campoBusca.focus();
    return;
  }

  mostrarMensagem(
    "A busca por administrador serÃ¡ ativada na prÃ³xima etapa, com autenticaÃ§Ã£o."
  );
});

carregarFilmes();

```

# ARQUIVO: backup\index.html

```

<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#101010">
  <title>StreamFlix</title>
  <link rel="stylesheet" href="/css/style.css">
  <script src="/js/app.js" defer></script>
</head>
<body>
  <header class="cabecalho">
    <a class="logo" href="/" aria-label="StreamFlix - inÃ­cio">
      Stream<span>Flix</span>
    </a>

    <div class="usuario">
      <img
        id="avatarUsuario"
        class="avatar"
        src="/imagens/perfil/goku.png"
        alt=""
      >
      <span id="nomeUsuario">@StreamFlix</span>
      <button id="btnPerfil" type="button" disabled>
        Ver Perfil
      </button>
      <button id="btnLogin" type="button">Entrar</button>
    </div>
  </header>

  <main class="conteudo">
    <section class="introducao">
      <p class="sobretitulo">SEU UNIVERSO DE FILMES</p>
      <h1>Descubra seu prÃ³ximo filme.</h1>
      <p class="descricao">
        Explore o catÃ¡logo, conheÃ§a os curadores e compartilhe seus favoritos.
      </p>
    </section>

    <section class="catalogo" aria-labelledby="tituloCatalogo">
      <div class="catalogo-topo">
        <div>
          <h2 id="tituloCatalogo">CatÃ¡logo</h2>
          <p id="statusCatalogo" role="status">Carregando filmes...</p>
        </div>

        <form id="formBusca" class="busca">
          <label class="sr-only" for="campoBusca">
            Buscar administrador
          </label>
          <input
            id="campoBusca"
            type="search"
            placeholder="Digite o nome do administrador"
            autocomplete="off"
          >
          <button type="submit" aria-label="Buscar administrador">
            <img src="/icons/lupa.svg" alt="">
          </button>
        </form>
      </div>

      <div id="mensagem" class="mensagem" role="status" hidden></div>
      <div id="galeria" class="galeria"></div>
    </section>
  </main>

  <footer class="rodape">
    <a class="logo" href="/">Stream<span>Flix</span></a>
    <p>Â© 2026â€“2027 StreamFlix. Todos os direitos reservados.</p>
  </footer>
</body>
</html>

```

# ARQUIVO: backup\style.css

```

:root {
  color-scheme: dark;
  font-family: Inter, "Segoe UI", Arial, sans-serif;
  background: #101010;
  color: #f5f5f5;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  --fundo-card: #1b1b1b;
  --texto-secundario: #aaa;
  --destaque: #e50914;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

button,
input {
  font: inherit;
}

button {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

a {
  color: inherit;
  text-decoration: none;
}

.cabecalho {
  min-height: 76px;
  padding: 16px 5%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  border-bottom: 1px solid #292929;
}

.logo {
  font-size: 27px;
  font-weight: 900;
  letter-spacing: -1px;
}

.logo span {
  color: var(--destaque);
}

.usuario {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.avatar {
  width: 38px;
  height: 38px;
  object-fit: cover;
  border-radius: 50%;
  background: #292929;
}

.usuario button {
  padding: 9px 13px;
  color: white;
  background: #292929;
  border: 1px solid #444;
  border-radius: 7px;
}

.usuario button:last-child {
  background: var(--destaque);
  border-color: var(--destaque);
}

.conteudo {
  width: min(1200px, 90%);
  margin: 0 auto;
  flex: 1;
}

.introducao {
  padding: 58px 0 40px;
}

.sobretitulo {
  color: #ff626a;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2px;
}

.introducao h1 {
  max-width: 700px;
  margin: 12px 0;
  font-size: clamp(32px, 5vw, 52px);
  letter-spacing: -1.5px;
}

.descricao,
.catalogo-topo p {
  color: var(--texto-secundario);
  line-height: 1.6;
}

.catalogo {
  padding-bottom: 56px;
}

.catalogo-topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.catalogo-topo h2 {
  margin-bottom: 4px;
  font-size: 24px;
}

.catalogo-topo p {
  margin-top: 0;
  font-size: 13px;
}

.busca {
  display: flex;
  width: min(360px, 100%);
  border: 1px solid #444;
  border-radius: 8px;
  overflow: hidden;
  background: #1a1a1a;
}

.busca:focus-within {
  outline: 2px solid #e50914;
  outline-offset: 2px;
}

.busca input {
  width: 100%;
  min-width: 0;
  padding: 12px;
  color: white;
  background: transparent;
  border: 0;
  outline: none;
}

.busca button {
  width: 46px;
  flex-shrink: 0;
  border: 0;
  background: transparent;
}

.busca button img {
  width: 20px;
  height: 20px;
}

.galeria {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 26px 20px;
}

.filme {
  min-width: 0;
}

.capa-container {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 10;
  border-radius: 10px;
  background: #252525;
}

.capa {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter 180ms ease;
}

.filme:hover .capa {
  filter: brightness(0.65);
}

.detalhes-capa {
  position: absolute;
  inset: auto 0 0;
  padding: 30px 14px 14px;
  background: linear-gradient(transparent, rgb(0 0 0 / 90%));
  opacity: 0;
  transition: opacity 180ms ease;
  pointer-events: none;
}

.filme:hover .detalhes-capa,
.filme:focus-within .detalhes-capa {
  opacity: 1;
}

.detalhes-capa p {
  margin: 4px 0 0;
  font-size: 13px;
}

.filme h3 {
  margin: 13px 0 8px;
  font-size: 16px;
  overflow-wrap: anywhere;
}

.filme-rodape {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: var(--texto-secundario);
  font-size: 13px;
}

.curtidas {
  display: flex;
  align-items: center;
  gap: 7px;
}

.curtidas img {
  width: 18px;
  height: 18px;
}

.mensagem {
  margin: 16px 0;
  padding: 14px;
  color: #ffb5b9;
  background: #301719;
  border-radius: 8px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.rodape {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 24px 5%;
  background: #080808;
  border-top: 1px solid #292929;
}

.rodape p {
  color: #999;
  font-size: 12px;
  text-align: right;
}

@media (max-width: 760px) {
  .cabecalho {
    align-items: flex-start;
  }

  .usuario {
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .usuario #nomeUsuario {
    display: none;
  }

  .catalogo-topo {
    align-items: stretch;
    flex-direction: column;
  }

  .busca {
    width: 100%;
  }

  .galeria {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 22px 14px;
  }

  .rodape {
    align-items: flex-start;
    flex-direction: column;
  }

  .rodape p {
    text-align: left;
  }
}

@media (max-width: 430px) {
  .galeria {
    grid-template-columns: 1fr;
  }

  .introducao {
    padding-top: 36px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}

```

# ARQUIVO: package.json

```

{
  "name": "saep",
  "version": "1.0.0",
  "private": true,
  "description": "saep",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "node src/server.js",
    "audit": "npm audit"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "bcryptjs": "^3.0.2",
    "connect-pg-simple": "^10.0.0",
    "dotenv": "^17.2.3",
    "express": "^5.1.0",
    "express-rate-limit": "^8.1.0",
    "express-session": "^1.18.2",
    "helmet": "^8.1.0",
    "multer": "^2.0.2",
    "pg": "^8.16.3"
  }
}

```

# ARQUIVO: package-lock.json

```
{
  "name": "saep",
  "version": "1.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "saep",
      "version": "1.0.0",
      "license": "ISC",
      "dependencies": {
        "bcryptjs": "^3.0.2",
        "connect-pg-simple": "^10.0.0",
        "dotenv": "^17.2.3",
        "express": "^5.1.0",
        "express-rate-limit": "^8.1.0",
        "express-session": "^1.18.2",
        "helmet": "^8.1.0",
        "multer": "^2.0.2",
        "pg": "^8.16.3"
      }
    },
    "node_modules/accepts": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/accepts/-/accepts-2.0.0.tgz",
      "integrity": "sha512-5cvg6CtKwfgdmVqY1WIiXKc3Q1bkRqGLi+2W/6ao+6Y7gu/RCwRuAhGEzh5B4KlszSuTLgZYuqFqo5bImjNKng==",
      "license": "MIT",
      "dependencies": {
        "mime-types": "^3.0.0",
        "negotiator": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/append-field": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/append-field/-/append-field-1.0.0.tgz",
      "integrity": "sha512-klpgFSWLW1ZEs8svjfb7g4qWY0YS5imI82dTg+QahUvJ8YqAY0P10Uk8tTyh9ZGuYEZEMaeJYCF5BFuX552hsw==",
      "license": "MIT"
    },
    "node_modules/bcryptjs": {
      "version": "3.0.3",
      "resolved": "https://registry.npmjs.org/bcryptjs/-/bcryptjs-3.0.3.tgz",
      "integrity": "sha512-GlF5wPWnSa/X5LKM1o0wz0suXIINz1iHRLvTS+sLyi7XPbe5ycmYI3DlZqVGZZtDgl4DmasFg7gOB3JYbphV5g==",
      "license": "BSD-3-Clause",
      "bin": {
        "bcrypt": "bin/bcrypt"
      }
    },
    "node_modules/body-parser": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/body-parser/-/body-parser-2.3.0.tgz",
      "integrity": "sha512-2cGmJupaNgg+QUwVLAucDuWuoMZ6EX9iHDRswZ5lsNYEmwPaRknMPCLZz07yTzVq/83p4o/wzbDZbBrTvGGTIw==",
      "license": "MIT",
      "dependencies": {
        "bytes": "^3.1.2",
        "content-type": "^2.0.0",
        "debug": "^4.4.3",
        "http-errors": "^2.0.1",
        "iconv-lite": "^0.7.2",
        "on-finished": "^2.4.1",
        "qs": "^6.15.2",
        "raw-body": "^3.0.2",
        "type-is": "^2.1.0"
      },
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/busboy": {
      "version": "1.6.0",
      "resolved": "https://registry.npmjs.org/busboy/-/busboy-1.6.0.tgz",
      "integrity": "sha512-8SFQbg/0hQ9xy3UNTB0YEnsNBbWfhf7RtnzpL7TkBiTBRfrQ9Fxcnz7VJsleJpyp6rVLvXiuORqjlHi5q+PYuA==",
      "dependencies": {
        "streamsearch": "^1.1.0"
      },
      "engines": {
        "node": ">=10.16.0"
      }
    },
    "node_modules/bytes": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/bytes/-/bytes-3.1.2.tgz",
      "integrity": "sha512-/Nf7TyzTx6S3yRJObOAV7956r8cr2+Oj8AC5dt8wSP3BQAoeX58NoHyCU8P8zGkNXStjTSi6fzO6F0pBdcYbEg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/call-bind-apply-helpers": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/call-bind-apply-helpers/-/call-bind-apply-helpers-1.0.2.tgz",
      "integrity": "sha512-Sp1ablJ0ivDkSzjcaJdxEunN5/XvksFJ2sMBFfq6x0ryhQV/2b/KwFe21cMpmHtPOSij8K99/wSfoEuTObmuMQ==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/call-bound": {
      "version": "1.0.4",
      "resolved": "https://registry.npmjs.org/call-bound/-/call-bound-1.0.4.tgz",
      "integrity": "sha512-+ys997U96po4Kx/ABpBCqhA9EuxJaQWDQg7295H4hBphv3IZg0boBKuwYpt4YXp6MZ5AmZQnU/tyMTlRpaSejg==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.2",
        "get-intrinsic": "^1.3.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/connect-pg-simple": {
      "version": "10.0.0",
      "resolved": "https://registry.npmjs.org/connect-pg-simple/-/connect-pg-simple-10.0.0.tgz",
      "integrity": "sha512-pBGVazlqiMrackzCr0eKhn4LO5trJXsOX0nQoey9wCOayh80MYtThCbq8eoLsjpiWgiok/h+1/uti9/2/Una8A==",
      "license": "MIT",
      "dependencies": {
        "pg": "^8.12.0"
      },
      "engines": {
        "node": "^18.18.0 || ^20.9.0 || >=22.0.0"
      }
    },
    "node_modules/content-disposition": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/content-disposition/-/content-disposition-2.0.1.tgz",
      "integrity": "sha512-e+H0ZXHSWYrENhQzw1LPuP4oF5MzVKmDU6d3hxlvaPEYLLg62MxtQNPRx4SYSuYJSBUgnQIG4HIN2tEtNv7Dog==",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/content-type": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/content-type/-/content-type-2.1.0.tgz",
      "integrity": "sha512-mj7UPXE0jaqaOsukNZRUEfEi2AcL7C/vwmwcHV0O97eO1E1pxBZuyjlZrx5seTaNBg1U6+o35wpa35Qfcc+7ag==",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/cookie": {
      "version": "0.7.2",
      "resolved": "https://registry.npmjs.org/cookie/-/cookie-0.7.2.tgz",
      "integrity": "sha512-yki5XnKuf750l50uGTllt6kKILY4nQ1eNIQatoXEByZ5dWgnKqbnqmTrBE5B4N7lrMJKQ2ytWMiTO2o0v6Ew/w==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/cookie-signature": {
      "version": "1.2.2",
      "resolved": "https://registry.npmjs.org/cookie-signature/-/cookie-signature-1.2.2.tgz",
      "integrity": "sha512-D76uU73ulSXrD1UXF4KE2TMxVVwhsnCgfAyTg9k8P6KGZjlXKrOLe4dJQKI3Bxi5wjesZoFXJWElNWBjPZMbhg==",
      "license": "MIT",
      "engines": {
        "node": ">=6.6.0"
      }
    },
    "node_modules/debug": {
      "version": "4.4.3",
      "resolved": "https://registry.npmjs.org/debug/-/debug-4.4.3.tgz",
      "integrity": "sha512-RGwwWnwQvkVfavKVt22FGLw+xYSdzARwm0ru6DhTVA3umU5hZc28V3kO4stgYryrTlLpuvgI9GiijltAjNbcqA==",
      "license": "MIT",
      "dependencies": {
        "ms": "^2.1.3"
      },
      "engines": {
        "node": ">=6.0"
      },
      "peerDependenciesMeta": {
        "supports-color": {
          "optional": true
        }
      }
    },
    "node_modules/depd": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/depd/-/depd-2.0.0.tgz",
      "integrity": "sha512-g7nH6P6dyDioJogAAGprGpCtVImJhpPk/roCzdb3fIh61/s/nPsfR6onyMwkCAR/OlC3yBC0lESvUoQEAssIrw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/dotenv": {
      "version": "17.4.2",
      "resolved": "https://registry.npmjs.org/dotenv/-/dotenv-17.4.2.tgz",
      "integrity": "sha512-nI4U3TottKAcAD9LLud4Cb7b2QztQMUEfHbvhTH09bqXTxnSie8WnjPALV/WMCrJZ6UV/qHJ6L03OqO3LcdYZw==",
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://dotenvx.com"
      }
    },
    "node_modules/dunder-proto": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/dunder-proto/-/dunder-proto-1.0.1.tgz",
      "integrity": "sha512-KIN/nDJBQRcXw0MLVhZE9iQHmG68qAVIBg9CqmUYjmQIhgij9U5MFvrqkUL5FbtyyzZuOeOt0zdeRe4UY7ct+A==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.1",
        "es-errors": "^1.3.0",
        "gopd": "^1.2.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/ee-first": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/ee-first/-/ee-first-1.1.1.tgz",
      "integrity": "sha512-WMwm9LhRUo+WUaRN+vRuETqG89IgZphVSNkdFgeb6sS/E4OrDIN7t48CAewSHXc6C8lefD8KKfr5vY61brQlow==",
      "license": "MIT"
    },
    "node_modules/encodeurl": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/encodeurl/-/encodeurl-2.0.0.tgz",
      "integrity": "sha512-Q0n9HRi4m6JuGIV1eFlmvJB7ZEVxu93IrMyiMsGC0lrMJMWzRgx6WGquyfQgZVb31vhGgXnfmPNNXmxnOkRBrg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/es-define-property": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/es-define-property/-/es-define-property-1.0.1.tgz",
      "integrity": "sha512-e3nRfgfUZ4rNGL232gUgX06QNyyez04KdjFrF+LTRoOXmrOgFKDg4BCdsjW8EnT69eqdYGmRpJwiPVYNrCaW3g==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-errors": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/es-errors/-/es-errors-1.3.0.tgz",
      "integrity": "sha512-Zf5H2Kxt2xjTvbJvP2ZWLEICxA6j+hAmMzIlypy4xcBg1vKVnx89Wy0GbS+kf5cwCVFFzdCFh2XSCFNULS6csw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-object-atoms": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/es-object-atoms/-/es-object-atoms-1.1.2.tgz",
      "integrity": "sha512-HWcBoN6NileqtSydK2FqHbS/LoDd2pqrnQHLyJzBj4kOp/ky2MWMN694xOfkK8/SnUsW2DH7EfyVlydKCsm1Zw==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/escape-html": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/escape-html/-/escape-html-1.0.3.tgz",
      "integrity": "sha512-NiSupZ4OeuGwr68lGIeym/ksIZMJodUGOSCZ/FSnTxcrekbvqrgdUxlJOMpijaKZVjAJrWrGs/6Jy8OMuyj9ow==",
      "license": "MIT"
    },
    "node_modules/etag": {
      "version": "1.8.1",
      "resolved": "https://registry.npmjs.org/etag/-/etag-1.8.1.tgz",
      "integrity": "sha512-aIL5Fx7mawVa300al2BnEE4iNvo1qETxLrPI/o05L7z6go7fCw1J6EQmbK4FmJ2AS7kgVF/KEZWufBfdClMcPg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/express": {
      "version": "5.3.0",
      "resolved": "https://registry.npmjs.org/express/-/express-5.3.0.tgz",
      "integrity": "sha512-qCqy1xSoaugxOD4IVHb1ZWdkvCF2W3aE2okKouWj8VwJ+ztskSiXoBnCSJqfKT+cVPJhuJqe9YLbY425+Zh00g==",
      "license": "MIT",
      "dependencies": {
        "accepts": "^2.0.0",
        "body-parser": "^2.3.0",
        "content-disposition": "^2.0.1",
        "content-type": "^2.0.0",
        "cookie": "^0.7.1",
        "cookie-signature": "^1.2.1",
        "debug": "^4.4.0",
        "depd": "^2.0.0",
        "encodeurl": "^2.0.0",
        "escape-html": "^1.0.3",
        "etag": "^1.8.1",
        "finalhandler": "^2.1.0",
        "fresh": "^2.0.0",
        "http-errors": "^2.0.0",
        "merge-descriptors": "^2.0.0",
        "mime-types": "^3.0.0",
        "on-finished": "^2.4.1",
        "once": "^1.4.0",
        "parseurl": "^1.3.3",
        "proxy-addr": "^2.0.8",
        "qs": "^6.16.0",
        "range-parser": "^1.2.1",
        "router": "^2.2.0",
        "send": "^1.1.0",
        "serve-static": "^2.2.0",
        "statuses": "^2.0.1",
        "type-is": "^2.1.0",
        "vary": "^1.1.2"
      },
      "engines": {
        "node": ">= 18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/express-rate-limit": {
      "version": "8.7.1",
      "resolved": "https://registry.npmjs.org/express-rate-limit/-/express-rate-limit-8.7.1.tgz",
      "integrity": "sha512-2FXbqkygil3mZiXzEtM0IjE/UBmBNot0J1GEVrJT4JbrvwOSoEtqtO+wHbiMQELWe1eNvHoYRg2dkjOid+6JkA==",
      "license": "MIT",
      "dependencies": {
        "debug": "^4.4.3",
        "ip-address": "^10.2.0"
      },
      "engines": {
        "node": ">= 16"
      },
      "funding": {
        "url": "https://github.com/sponsors/express-rate-limit"
      },
      "peerDependencies": {
        "express": ">= 4.11"
      }
    },
    "node_modules/express-session": {
      "version": "1.19.0",
      "resolved": "https://registry.npmjs.org/express-session/-/express-session-1.19.0.tgz",
      "integrity": "sha512-0csaMkGq+vaiZTmSMMGkfdCOabYv192VbytFypcvI0MANrp+4i/7yEkJ0sbAEhycQjntaKGzYfjfXQyVb7BHMA==",
      "license": "MIT",
      "dependencies": {
        "cookie": "~0.7.2",
        "cookie-signature": "~1.0.7",
        "debug": "~2.6.9",
        "depd": "~2.0.0",
        "on-headers": "~1.1.0",
        "parseurl": "~1.3.3",
        "safe-buffer": "~5.2.1",
        "uid-safe": "~2.1.5"
      },
      "engines": {
        "node": ">= 0.8.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/express-session/node_modules/cookie-signature": {
      "version": "1.0.7",
      "resolved": "https://registry.npmjs.org/cookie-signature/-/cookie-signature-1.0.7.tgz",
      "integrity": "sha512-NXdYc3dLr47pBkpUCHtKSwIOQXLVn8dZEuywboCOJY/osA0wFSLlSawr3KN8qXJEyX66FcONTH8EIlVuK0yyFA==",
      "license": "MIT"
    },
    "node_modules/express-session/node_modules/debug": {
      "version": "2.6.9",
      "resolved": "https://registry.npmjs.org/debug/-/debug-2.6.9.tgz",
      "integrity": "sha512-bC7ElrdJaJnPbAP+1EotYvqZsb3ecl5wi6Bfi6BJTUcNowp6cvspg0jXznRTKDjm/E7AdgFBVeAPVMNcKGsHMA==",
      "license": "MIT",
      "dependencies": {
        "ms": "2.0.0"
      }
    },
    "node_modules/express-session/node_modules/ms": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.0.0.tgz",
      "integrity": "sha512-Tpp60P6IUJDTuOq/5Z8cdskzJujfwqfOTkrwIwj7IRISpnkJnT6SyJ4PCPnGMoFjC9ddhal5KVIYtAt97ix05A==",
      "license": "MIT"
    },
    "node_modules/finalhandler": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/finalhandler/-/finalhandler-2.1.1.tgz",
      "integrity": "sha512-S8KoZgRZN+a5rNwqTxlZZePjT/4cnm0ROV70LedRHZ0p8u9fRID0hJUZQpkKLzro8LfmC8sx23bY6tVNxv8pQA==",
      "license": "MIT",
      "dependencies": {
        "debug": "^4.4.0",
        "encodeurl": "^2.0.0",
        "escape-html": "^1.0.3",
        "on-finished": "^2.4.1",
        "parseurl": "^1.3.3",
        "statuses": "^2.0.1"
      },
      "engines": {
        "node": ">= 18.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/forwarded": {
      "version": "0.2.0",
      "resolved": "https://registry.npmjs.org/forwarded/-/forwarded-0.2.0.tgz",
      "integrity": "sha512-buRG0fpBtRHSTCOASe6hD258tEubFoRLb4ZNA6NxMVHNw2gOcwHo9wyablzMzOA5z9xA9L1KNjk/Nt6MT9aYow==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/fresh": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/fresh/-/fresh-2.0.0.tgz",
      "integrity": "sha512-Rx/WycZ60HOaqLKAi6cHRKKI7zxWbJ31MhntmtwMoaTeF7XFH9hhBp8vITaMidfljRQ6eYWCKkaTK+ykVJHP2A==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/function-bind": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/function-bind/-/function-bind-1.1.2.tgz",
      "integrity": "sha512-7XHNxH7qX9xG5mIwxkhumTox/MIRNcOgDrxWsMt2pAr23WHp6MrRlN7FBSFpCpr+oVO0F744iUgR82nJMfG2SA==",
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/get-intrinsic": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/get-intrinsic/-/get-intrinsic-1.3.0.tgz",
      "integrity": "sha512-9fSjSaos/fRIVIp+xSJlE6lfwhES7LNtKaCBIamHsjr2na1BiABJPo0mOjjz8GJDURarmCPGqaiVg5mfjb98CQ==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.2",
        "es-define-property": "^1.0.1",
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.1.1",
        "function-bind": "^1.1.2",
        "get-proto": "^1.0.1",
        "gopd": "^1.2.0",
        "has-symbols": "^1.1.0",
        "hasown": "^2.0.2",
        "math-intrinsics": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/get-proto": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/get-proto/-/get-proto-1.0.1.tgz",
      "integrity": "sha512-sTSfBjoXBp89JvIKIefqw7U2CCebsc74kiY6awiGogKtoSGbgjYE/G/+l9sF3MWFPNc9IcoOC4ODfKHfxFmp0g==",
      "license": "MIT",
      "dependencies": {
        "dunder-proto": "^1.0.1",
        "es-object-atoms": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/gopd": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/gopd/-/gopd-1.2.0.tgz",
      "integrity": "sha512-ZUKRh6/kUFoAiTAtTYPZJ3hw9wNxx+BIBOijnlG9PnrJsCcSjs1wyyD6vJpaYtgnzDrKYRSqf3OO6Rfa93xsRg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/has-symbols": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/has-symbols/-/has-symbols-1.1.0.tgz",
      "integrity": "sha512-1cDNdwJ2Jaohmb3sg4OmKaMBwuC48sYni5HUw2DvsC8LjGTLK9h+eb1X6RyuOHe4hT0ULCW68iomhjUoKUqlPQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/hasown": {
      "version": "2.0.4",
      "resolved": "https://registry.npmjs.org/hasown/-/hasown-2.0.4.tgz",
      "integrity": "sha512-T2UbfbBEF32wiepXIsMlTW9+dDYC6wMh/t/vYA4tuOMKqWz/n3vr1NFSxQiyP+zk2mXsoMA/i/7qV6LKut1t1A==",
      "license": "MIT",
      "dependencies": {
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/helmet": {
      "version": "8.3.0",
      "resolved": "https://registry.npmjs.org/helmet/-/helmet-8.3.0.tgz",
      "integrity": "sha512-Qgpiaws3Sm30Av8Eah6sjMCZZwjlBu+E68rhpCWBshY1lb09HtLwj5GviX0OyQIn+ulUS0iX0AxN5n3tLZzz1w==",
      "license": "MIT",
      "engines": {
        "node": ">=18.0.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/EvanHahn"
      }
    },
    "node_modules/http-errors": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/http-errors/-/http-errors-2.0.1.tgz",
      "integrity": "sha512-4FbRdAX+bSdmo4AUFuS0WNiPz8NgFt+r8ThgNWmlrjQjt1Q7ZR9+zTlce2859x4KSXrwIsaeTqDoKQmtP8pLmQ==",
      "license": "MIT",
      "dependencies": {
        "depd": "~2.0.0",
        "inherits": "~2.0.4",
        "setprototypeof": "~1.2.0",
        "statuses": "~2.0.2",
        "toidentifier": "~1.0.1"
      },
      "engines": {
        "node": ">= 0.8"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/iconv-lite": {
      "version": "0.7.3",
      "resolved": "https://registry.npmjs.org/iconv-lite/-/iconv-lite-0.7.3.tgz",
      "integrity": "sha512-IKXpvIzjnC9XTAUbVBcMfGS0EPaIXtW6v+zr+RRp+hqULEpo0owZax6wyRwPOJbWbzjYspQwusTsfVr0ifh4uQ==",
      "license": "MIT",
      "dependencies": {
        "safer-buffer": ">= 2.1.2 < 3.0.0"
      },
      "engines": {
        "node": ">=0.10.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/inherits": {
      "version": "2.0.4",
      "resolved": "https://registry.npmjs.org/inherits/-/inherits-2.0.4.tgz",
      "integrity": "sha512-k/vGaX4/Yla3WzyMCvTQOXYeIHvqOKtnqBduzTHpzpQZzAskKMhZ2K+EnBiSM9zGSoIFeMpXKxa4dYeZIQqewQ==",
      "license": "ISC"
    },
    "node_modules/ip-address": {
      "version": "10.7.4",
      "resolved": "https://registry.npmjs.org/ip-address/-/ip-address-10.7.4.tgz",
      "integrity": "sha512-DWBMKyeM25D70nrIiTkgQth59/G+naKOTep6huF9j+GmeK3DMD60Zvxg5d5qQnz+38AHgou6ean2LECX+lrKDg==",
      "license": "MIT",
      "engines": {
        "node": ">= 12"
      }
    },
    "node_modules/ipaddr.js": {
      "version": "1.9.1",
      "resolved": "https://registry.npmjs.org/ipaddr.js/-/ipaddr.js-1.9.1.tgz",
      "integrity": "sha512-0KI/607xoxSToH7GjN1FfSbLoU0+btTicjsQSWQlh/hZykN8KpmMf7uYwPW3R+akZ6R/w18ZlXSHBYXiYUPO3g==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.10"
      }
    },
    "node_modules/is-promise": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/is-promise/-/is-promise-4.0.0.tgz",
      "integrity": "sha512-hvpoI6korhJMnej285dSg6nu1+e6uxs7zG3BYAm5byqDsgJNWwxzM6z6iZiAgQR4TJ30JmBTOwqZUw3WlyH3AQ==",
      "license": "MIT"
    },
    "node_modules/math-intrinsics": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/math-intrinsics/-/math-intrinsics-1.1.0.tgz",
      "integrity": "sha512-/IXtbwEk5HTPyEwyKX6hGkYXxM9nbj64B+ilVJnC/R6B0pH5G4V3b0pVbL7DBj4tkhBAppbQUlf6F6Xl9LHu1g==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/media-typer": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/media-typer/-/media-typer-1.1.1.tgz",
      "integrity": "sha512-yz3xRaG20c6/BOzvYoDaGtPmGscs7YivItZEEqe6GbwNfHuxu9YNmvnEkMzKldAGY4/80pRcQRZSEnhquk9XuQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/merge-descriptors": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/merge-descriptors/-/merge-descriptors-2.0.0.tgz",
      "integrity": "sha512-Snk314V5ayFLhp3fkUREub6WtjBfPdCPY1Ln8/8munuLuiYhsABgBVWsozAG+MWMbVEvcdcpbi9R7ww22l9Q3g==",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/mime-db": {
      "version": "1.54.0",
      "resolved": "https://registry.npmjs.org/mime-db/-/mime-db-1.54.0.tgz",
      "integrity": "sha512-aU5EJuIN2WDemCcAp2vFBfp/m4EAhWJnUNSSw0ixs7/kXbd6Pg64EmwJkNdFhB8aWt1sH2CTXrLxo/iAGV3oPQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/mime-types": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/mime-types/-/mime-types-3.0.2.tgz",
      "integrity": "sha512-Lbgzdk0h4juoQ9fCKXW4by0UJqj+nOOrI9MJ1sSj4nI8aI2eo1qmvQEie4VD1glsS250n15LsWsYtCugiStS5A==",
      "license": "MIT",
      "dependencies": {
        "mime-db": "^1.54.0"
      },
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/ms": {
      "version": "2.1.3",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",
      "integrity": "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==",
      "license": "MIT"
    },
    "node_modules/multer": {
      "version": "2.4.0",
      "resolved": "https://registry.npmjs.org/multer/-/multer-2.4.0.tgz",
      "integrity": "sha512-7dqa0ZcFfzbefdTuIkzOSMvZWC0J7FLqBOjJUZvDCXShIURWKxAyTT1wHhnE5q19c7jOJf43IYYKjBmZVZmvhg==",
      "license": "MIT",
      "dependencies": {
        "append-field": "^1.0.0",
        "busboy": "^1.6.0",
        "type-is": "^1.6.18"
      },
      "engines": {
        "node": ">= 10.16.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/multer/node_modules/media-typer": {
      "version": "0.3.0",
      "resolved": "https://registry.npmjs.org/media-typer/-/media-typer-0.3.0.tgz",
      "integrity": "sha512-dq+qelQ9akHpcOl/gUVRTxVIOkAJ1wR3QAvb4RsVjS8oVoFjDGTc679wJYmUmknUF5HwMLOgb5O+a3KxfWapPQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/multer/node_modules/mime-db": {
      "version": "1.52.0",
      "resolved": "https://registry.npmjs.org/mime-db/-/mime-db-1.52.0.tgz",
      "integrity": "sha512-sPU4uV7dYlvtWJxwwxHD0PuihVNiE7TyAbQ5SWxDCB9mUYvOgroQOwYQQOKPJ8CIbE+1ETVlOoK1UC2nU3gYvg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/multer/node_modules/mime-types": {
      "version": "2.1.35",
      "resolved": "https://registry.npmjs.org/mime-types/-/mime-types-2.1.35.tgz",
      "integrity": "sha512-ZDY+bPm5zTTF+YpCrAU9nK0UgICYPT0QtT1NZWFv4s++TNkcgVaT0g6+4R2uI4MjQjzysHB1zxuWL50hzaeXiw==",
      "license": "MIT",
      "dependencies": {
        "mime-db": "1.52.0"
      },
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/multer/node_modules/type-is": {
      "version": "1.6.18",
      "resolved": "https://registry.npmjs.org/type-is/-/type-is-1.6.18.tgz",
      "integrity": "sha512-TkRKr9sUTxEH8MdfuCSP7VizJyzRNMjj2J2do2Jr3Kym598JVdEksuzPQCnlFPW4ky9Q+iA+ma9BGm06XQBy8g==",
      "license": "MIT",
      "dependencies": {
        "media-typer": "0.3.0",
        "mime-types": "~2.1.24"
      },
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/negotiator": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/negotiator/-/negotiator-1.1.0.tgz",
      "integrity": "sha512-NMPBRMJgiQHjbd8phG3Vebdx4kZ1H121rbl5IkMqeOsahptB9BKo/d7oJ3zTXqTgagn2bWlNSXkh0QUGM31RYg==",
      "license": "MIT",
      "dependencies": {
        "content-type": "^2.1.0"
      },
      "engines": {
        "node": ">=18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/object-inspect": {
      "version": "1.13.4",
      "resolved": "https://registry.npmjs.org/object-inspect/-/object-inspect-1.13.4.tgz",
      "integrity": "sha512-W67iLl4J2EXEGTbfeHCffrjDfitvLANg0UlX3wFUUSTx92KXRFegMHUVgSqE+wvhAbi4WqjGg9czysTV2Epbew==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/on-finished": {
      "version": "2.4.1",
      "resolved": "https://registry.npmjs.org/on-finished/-/on-finished-2.4.1.tgz",
      "integrity": "sha512-oVlzkg3ENAhCk2zdv7IJwd/QUD4z2RxRwpkcGY8psCVcCYZNq4wYnVWALHM+brtuJjePWiYF/ClmuDr8Ch5+kg==",
      "license": "MIT",
      "dependencies": {
        "ee-first": "1.1.1"
      },
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/on-headers": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/on-headers/-/on-headers-1.1.0.tgz",
      "integrity": "sha512-737ZY3yNnXy37FHkQxPzt4UZ2UWPWiCZWLvFZ4fu5cueciegX0zGPnrlY6bwRg4FdQOe9YU8MkmJwGhoMybl8A==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/once": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/once/-/once-1.4.0.tgz",
      "integrity": "sha512-lNaJgI+2Q5URQBkccEKHTQOPaXdUxnZZElQTZY0MFUAuaEqe1E+Nyvgdz/aIyNi6Z9MzO5dv1H8n58/GELp3+w==",
      "license": "ISC",
      "dependencies": {
        "wrappy": "1"
      }
    },
    "node_modules/parseurl": {
      "version": "1.3.3",
      "resolved": "https://registry.npmjs.org/parseurl/-/parseurl-1.3.3.tgz",
      "integrity": "sha512-CiyeOxFT/JZyN5m0z9PfXw4SCBJ6Sygz1Dpl0wqjlhDEGGBP1GnsUVEL0p63hoG1fcj3fHynXi9NYO4nWOL+qQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/path-to-regexp": {
      "version": "8.4.2",
      "resolved": "https://registry.npmjs.org/path-to-regexp/-/path-to-regexp-8.4.2.tgz",
      "integrity": "sha512-qRcuIdP69NPm4qbACK+aDogI5CBDMi1jKe0ry5rSQJz8JVLsC7jV8XpiJjGRLLol3N+R5ihGYcrPLTno6pAdBA==",
      "license": "MIT",
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/pg": {
      "version": "8.23.1",
      "resolved": "https://registry.npmjs.org/pg/-/pg-8.23.1.tgz",
      "integrity": "sha512-aL96AHANtWjPLDOLqnhx+ngp9+UK7ETEU8VJrDCGvsSSi/mGLcWYsS6Herg7lmaBJe4uwrfqsa7gTEFaSizDoQ==",
      "license": "MIT",
      "dependencies": {
        "pg-connection-string": "^2.14.1",
        "pg-pool": "^3.14.0",
        "pg-protocol": "^1.16.1",
        "pg-types": "2.2.0",
        "pgpass": "1.0.5"
      },
      "engines": {
        "node": ">= 16.0.0"
      },
      "optionalDependencies": {
        "pg-cloudflare": "^1.4.1"
      },
      "peerDependencies": {
        "pg-native": ">=3.0.1"
      },
      "peerDependenciesMeta": {
        "pg-native": {
          "optional": true
        }
      }
    },
    "node_modules/pg-cloudflare": {
      "version": "1.4.1",
      "resolved": "https://registry.npmjs.org/pg-cloudflare/-/pg-cloudflare-1.4.1.tgz",
      "integrity": "sha512-6PQbsFWZcp9EmJEwy5cGQ2La+AMWpP46lgbb8X+U/XsHIUweYDNCpeuKck5RxL2MdVFi7krbbEi5nX4Zh7JhrQ==",
      "license": "MIT",
      "optional": true
    },
    "node_modules/pg-connection-string": {
      "version": "2.14.1",
      "resolved": "https://registry.npmjs.org/pg-connection-string/-/pg-connection-string-2.14.1.tgz",
      "integrity": "sha512-qR3kGNPBLpCNtz0evbKA0Y/MRFXwSSdT+pTJvYp/bXTcReZbvX1kzF0IyTc1QnxqF7AZbOeBhNL8R5mYQZV/MA==",
      "license": "MIT"
    },
    "node_modules/pg-int8": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/pg-int8/-/pg-int8-1.0.1.tgz",
      "integrity": "sha512-WCtabS6t3c8SkpDBUlb1kjOs7l66xsGdKpIPZsg4wR+B3+u9UAum2odSsF9tnvxg80h4ZxLWMy4pRjOsFIqQpw==",
      "license": "ISC",
      "engines": {
        "node": ">=4.0.0"
      }
    },
    "node_modules/pg-pool": {
      "version": "3.14.0",
      "resolved": "https://registry.npmjs.org/pg-pool/-/pg-pool-3.14.0.tgz",
      "integrity": "sha512-gKtPkFdQPU3DksooVLi9LsjZxrsBUZIpa+7aVx+LV5pNh0KzP4Zleud2po+ConrxbuXGBJ6Hfer6hdgpIBpBaw==",
      "license": "MIT",
      "peerDependencies": {
        "pg": ">=8.0"
      }
    },
    "node_modules/pg-protocol": {
      "version": "1.16.1",
      "resolved": "https://registry.npmjs.org/pg-protocol/-/pg-protocol-1.16.1.tgz",
      "integrity": "sha512-p9VOFMiHB/ZbJATetbg+99PxssTVSQRnyuPSQ67mN1+1KBOjZaZ83ZQzltnxPhJwSsC3nwVjJ10DVJlerbFzLg==",
      "license": "MIT"
    },
    "node_modules/pg-types": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/pg-types/-/pg-types-2.2.0.tgz",
      "integrity": "sha512-qTAAlrEsl8s4OiEQY69wDvcMIdQN6wdz5ojQiOy6YRMuynxenON0O5oCpJI6lshc6scgAY8qvJ2On/p+CXY0GA==",
      "license": "MIT",
      "dependencies": {
        "pg-int8": "1.0.1",
        "postgres-array": "~2.0.0",
        "postgres-bytea": "~1.0.0",
        "postgres-date": "~1.0.4",
        "postgres-interval": "^1.1.0"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/pgpass": {
      "version": "1.0.5",
      "resolved": "https://registry.npmjs.org/pgpass/-/pgpass-1.0.5.tgz",
      "integrity": "sha512-FdW9r/jQZhSeohs1Z3sI1yxFQNFvMcnmfuj4WBMUTxOrAyLMaTcE1aAMBiTlbMNaXvBCQuVi0R7hd8udDSP7ug==",
      "license": "MIT",
      "dependencies": {
        "split2": "^4.1.0"
      }
    },
    "node_modules/postgres-array": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/postgres-array/-/postgres-array-2.0.0.tgz",
      "integrity": "sha512-VpZrUqU5A69eQyW2c5CA1jtLecCsN2U/bD6VilrFDWq5+5UIEVO7nazS3TEcHf1zuPYO/sqGvUvW62g86RXZuA==",
      "license": "MIT",
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/postgres-bytea": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/postgres-bytea/-/postgres-bytea-1.0.1.tgz",
      "integrity": "sha512-5+5HqXnsZPE65IJZSMkZtURARZelel2oXUEO8rH83VS/hxH5vv1uHquPg5wZs8yMAfdv971IU+kcPUczi7NVBQ==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/postgres-date": {
      "version": "1.0.7",
      "resolved": "https://registry.npmjs.org/postgres-date/-/postgres-date-1.0.7.tgz",
      "integrity": "sha512-suDmjLVQg78nMK2UZ454hAG+OAW+HQPZ6n++TNDUX+L0+uUlLywnoxJKDou51Zm+zTCjrCl0Nq6J9C5hP9vK/Q==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/postgres-interval": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/postgres-interval/-/postgres-interval-1.2.0.tgz",
      "integrity": "sha512-9ZhXKM/rw350N1ovuWHbGxnGh/SNJ4cnxHiM0rxE4VN41wsg8P8zWn9hv/buK00RP4WvlOyr/RBDiptyxVbkZQ==",
      "license": "MIT",
      "dependencies": {
        "xtend": "^4.0.0"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/proxy-addr": {
      "version": "2.0.8",
      "resolved": "https://registry.npmjs.org/proxy-addr/-/proxy-addr-2.0.8.tgz",
      "integrity": "sha512-5nnx0yGyVUcY6t9RnWcARWtwT9F1D8O9rt08htPvnd49W1IgZtmLkhu9WfMzQj1cFxjHIO6connUNVW5k7AVyQ==",
      "license": "MIT",
      "dependencies": {
        "forwarded": "0.2.0",
        "ipaddr.js": "1.9.1"
      },
      "engines": {
        "node": ">= 0.10"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/qs": {
      "version": "6.16.1",
      "resolved": "https://registry.npmjs.org/qs/-/qs-6.16.1.tgz",
      "integrity": "sha512-5Px6J7rfHBAGUhNQ3es4YzcOdBBw0SDcVtThJml4RdnKw4tKs2epA0kPZ+K8X+WiHktT93RHVcQ/3ym5aTCgtg==",
      "license": "BSD-3-Clause",
      "dependencies": {
        "es-define-property": "^1.0.1",
        "side-channel": "^1.1.1"
      },
      "engines": {
        "node": ">=0.6"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/random-bytes": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/random-bytes/-/random-bytes-1.0.0.tgz",
      "integrity": "sha512-iv7LhNVO047HzYR3InF6pUcUsPQiHTM1Qal51DcGSuZFBil1aBBWG5eHPNek7bvILMaYJ/8RU1e8w1AMdHmLQQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/range-parser": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/range-parser/-/range-parser-1.3.0.tgz",
      "integrity": "sha512-hek2mFQpPuI4E1BBKrSto+BU3e3x4xuarsbiwr3+lf7p44juvFMV0XFWQAP3xUyqXA4RrXLIoaSUGbSt056ZMw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/raw-body": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/raw-body/-/raw-body-3.0.2.tgz",
      "integrity": "sha512-K5zQjDllxWkf7Z5xJdV0/B0WTNqx6vxG70zJE4N0kBs4LovmEYWJzQGxC9bS9RAKu3bgM40lrd5zoLJ12MQ5BA==",
      "license": "MIT",
      "dependencies": {
        "bytes": "~3.1.2",
        "http-errors": "~2.0.1",
        "iconv-lite": "~0.7.0",
        "unpipe": "~1.0.0"
      },
      "engines": {
        "node": ">= 0.10"
      }
    },
    "node_modules/router": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/router/-/router-2.2.0.tgz",
      "integrity": "sha512-nLTrUKm2UyiL7rlhapu/Zl45FwNgkZGaCpZbIHajDYgwlJCOzLSk+cIPAnsEqV955GjILJnKbdQC1nVPz+gAYQ==",
      "license": "MIT",
      "dependencies": {
        "debug": "^4.4.0",
        "depd": "^2.0.0",
        "is-promise": "^4.0.0",
        "parseurl": "^1.3.3",
        "path-to-regexp": "^8.0.0"
      },
      "engines": {
        "node": ">= 18"
      }
    },
    "node_modules/safe-buffer": {
      "version": "5.2.1",
      "resolved": "https://registry.npmjs.org/safe-buffer/-/safe-buffer-5.2.1.tgz",
      "integrity": "sha512-rp3So07KcdmmKbGvgaNxQSJr7bGVSVk5S9Eq1F+ppbRo70+YeaDxkw5Dd8NPN+GD6bjnYm2VuPuCXmpuYvmCXQ==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "MIT"
    },
    "node_modules/safer-buffer": {
      "version": "2.1.2",
      "resolved": "https://registry.npmjs.org/safer-buffer/-/safer-buffer-2.1.2.tgz",
      "integrity": "sha512-YZo3K82SD7Riyi0E1EQPojLz7kpepnSQI9IyPbHHg1XXXevb5dJI7tpyN2ADxGcQbHG7vcyRHk0cbwqcQriUtg==",
      "license": "MIT"
    },
    "node_modules/send": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/send/-/send-1.2.1.tgz",
      "integrity": "sha512-1gnZf7DFcoIcajTjTwjwuDjzuz4PPcY2StKPlsGAQ1+YH20IRVrBaXSWmdjowTJ6u8Rc01PoYOGHXfP1mYcZNQ==",
      "license": "MIT",
      "dependencies": {
        "debug": "^4.4.3",
        "encodeurl": "^2.0.0",
        "escape-html": "^1.0.3",
        "etag": "^1.8.1",
        "fresh": "^2.0.0",
        "http-errors": "^2.0.1",
        "mime-types": "^3.0.2",
        "ms": "^2.1.3",
        "on-finished": "^2.4.1",
        "range-parser": "^1.2.1",
        "statuses": "^2.0.2"
      },
      "engines": {
        "node": ">= 18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/serve-static": {
      "version": "2.2.1",
      "resolved": "https://registry.npmjs.org/serve-static/-/serve-static-2.2.1.tgz",
      "integrity": "sha512-xRXBn0pPqQTVQiC8wyQrKs2MOlX24zQ0POGaj0kultvoOCstBQM5yvOhAVSUwOMjQtTvsPWoNCHfPGwaaQJhTw==",
      "license": "MIT",
      "dependencies": {
        "encodeurl": "^2.0.0",
        "escape-html": "^1.0.3",
        "parseurl": "^1.3.3",
        "send": "^1.2.0"
      },
      "engines": {
        "node": ">= 18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/setprototypeof": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/setprototypeof/-/setprototypeof-1.2.0.tgz",
      "integrity": "sha512-E5LDX7Wrp85Kil5bhZv46j8jOeboKq5JMmYM3gVGdGH8xFpPWXUMsNrlODCrkoxMEeNi/XZIwuRvY4XNwYMJpw==",
      "license": "ISC"
    },
    "node_modules/side-channel": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/side-channel/-/side-channel-1.1.1.tgz",
      "integrity": "sha512-6x6dK6zJdpTzF4sQeNYxwtvBzf6Eg4GtlesS94HOvTudUeyK2WXAaIfmDgsyslYrRBeFIlsi54AYsFGUuhmvrQ==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "object-inspect": "^1.13.4",
        "side-channel-list": "^1.0.1",
        "side-channel-map": "^1.0.1",
        "side-channel-weakmap": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/side-channel-list": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/side-channel-list/-/side-channel-list-1.0.1.tgz",
      "integrity": "sha512-mjn/0bi/oUURjc5Xl7IaWi/OJJJumuoJFQJfDDyO46+hBWsfaVM65TBHq2eoZBhzl9EchxOijpkbRC8SVBQU0w==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "object-inspect": "^1.13.4"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/side-channel-map": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/side-channel-map/-/side-channel-map-1.0.1.tgz",
      "integrity": "sha512-VCjCNfgMsby3tTdo02nbjtM/ewra6jPHmpThenkTYh8pG9ucZ/1P8So4u4FGBek/BjpOVsDCMoLA/iuBKIFXRA==",
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.5",
        "object-inspect": "^1.13.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/side-channel-weakmap": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/side-channel-weakmap/-/side-channel-weakmap-1.0.2.tgz",
      "integrity": "sha512-WPS/HvHQTYnHisLo9McqBHOJk2FkHO/tlpvldyrnem4aeQp4hai3gythswg6p01oSoTl58rcpiFAjF2br2Ak2A==",
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.5",
        "object-inspect": "^1.13.3",
        "side-channel-map": "^1.0.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/split2": {
      "version": "4.2.0",
      "resolved": "https://registry.npmjs.org/split2/-/split2-4.2.0.tgz",
      "integrity": "sha512-UcjcJOWknrNkF6PLX83qcHM6KHgVKNkV62Y8a5uYDVv9ydGQVwAHMKqHdJje1VTWpljG0WYpCDhrCdAOYH4TWg==",
      "license": "ISC",
      "engines": {
        "node": ">= 10.x"
      }
    },
    "node_modules/statuses": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/statuses/-/statuses-2.0.2.tgz",
      "integrity": "sha512-DvEy55V3DB7uknRo+4iOGT5fP1slR8wQohVdknigZPMpMstaKJQWhwiYBACJE3Ul2pTnATihhBYnRhZQHGBiRw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/streamsearch": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/streamsearch/-/streamsearch-1.1.0.tgz",
      "integrity": "sha512-Mcc5wHehp9aXz1ax6bZUyY5afg9u2rv5cqQI3mRrYkGC8rW2hM02jWuwjtL++LS5qinSyhj2QfLyNsuc+VsExg==",
      "engines": {
        "node": ">=10.0.0"
      }
    },
    "node_modules/toidentifier": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/toidentifier/-/toidentifier-1.0.1.tgz",
      "integrity": "sha512-o5sSPKEkg/DIQNmH43V0/uerLrpzVedkUh8tGNvaeXpfpuwjKenlSox/2O/BTlZUtEe+JG7s5YhEz608PlAHRA==",
      "license": "MIT",
      "engines": {
        "node": ">=0.6"
      }
    },
    "node_modules/type-is": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/type-is/-/type-is-2.1.0.tgz",
      "integrity": "sha512-faYHw0anBbc/kWF3zFTEnxSFOAGUX9GFbOBthvDdLsIlEoWOFOtS0zgCiQYwIskL9iGXZL3kAXD8OoZ4GmMATA==",
      "license": "MIT",
      "dependencies": {
        "content-type": "^2.0.0",
        "media-typer": "^1.1.0",
        "mime-types": "^3.0.0"
      },
      "engines": {
        "node": ">= 18"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/express"
      }
    },
    "node_modules/uid-safe": {
      "version": "2.1.5",
      "resolved": "https://registry.npmjs.org/uid-safe/-/uid-safe-2.1.5.tgz",
      "integrity": "sha512-KPHm4VL5dDXKz01UuEd88Df+KzynaohSL9fBh096KWAxSKZQDI2uBrVqtvRM4rwrIrRRKsdLNML/lnaaVSRioA==",
      "license": "MIT",
      "dependencies": {
        "random-bytes": "~1.0.0"
      },
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/unpipe": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/unpipe/-/unpipe-1.0.0.tgz",
      "integrity": "sha512-pjy2bYhSsufwWlKwPc+l3cN7+wuJlK6uz0YdJEOlQDbl6jo/YlPi4mb8agUkVC8BF7V8NuzeyPNqRksA3hztKQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/vary": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/vary/-/vary-1.1.2.tgz",
      "integrity": "sha512-BNGbWLfd0eUPabhkXUVm0j8uuvREyTh5ovRa/dyow/BqAbZJyC+5fU+IzQOzmAKzYqYRAISoRhdQr3eIZ/PXqg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/wrappy": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/wrappy/-/wrappy-1.0.2.tgz",
      "integrity": "sha512-l4Sp/DRseor9wL6EvV2+TuQn63dMkPjZ/sp9XkghTEbV9KlPS1xUsZ3u7/IQO4wxtcFB4bgpQPRcR3QCvezPcQ==",
      "license": "ISC"
    },
    "node_modules/xtend": {
      "version": "4.0.2",
      "resolved": "https://registry.npmjs.org/xtend/-/xtend-4.0.2.tgz",
      "integrity": "sha512-LKYU1iAXJXUgAXn9URjiu+MWhyUXHsvfp7mcuYm9dSUKK0/CjtrUwFAxD82/mCWbtLsGjFIad0wIsod4zrTAEQ==",
      "license": "MIT",
      "engines": {
        "node": ">=0.4"
      }
    }
  }
}

```

# ARQUIVO: public\css\style.css

```

:root {
  color-scheme: dark;
  font-family: Inter, "Segoe UI", Arial, sans-serif;
  background: #101010;
  color: #f5f5f5;
  --texto-secundario: #aaa;
  --destaque: #e50914;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

button, input {
  font: inherit;
}

button {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
  opacity: .5;
}

a {
  color: inherit;
  text-decoration: none;
}

.cabecalho {
  min-height: 76px;
  padding: 16px 5%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  border-bottom: 1px solid #292929;
}

.logo {
  font-size: 27px;
  font-weight: 900;
  letter-spacing: -1px;
}

.logo span {
  color: var(--destaque);
}

.usuario {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.avatar {
  width: 38px;
  height: 38px;
  object-fit: cover;
  border-radius: 50%;
  background: #292929;
}

.usuario button {
  padding: 9px 13px;
  color: white;
  background: #292929;
  border: 1px solid #444;
  border-radius: 7px;
}

.usuario button:last-child {
  background: var(--destaque);
  border-color: var(--destaque);
}

.conteudo {
  width: min(1200px, 90%);
  margin: 0 auto;
  flex: 1;
}

.introducao {
  padding: 58px 0 40px;
}

.sobretitulo {
  color: #ff626a;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2px;
}

.introducao h1 {
  max-width: 700px;
  margin: 12px 0;
  font-size: clamp(32px, 5vw, 52px);
  letter-spacing: -1.5px;
}

.descricao, .catalogo-topo p {
  color: var(--texto-secundario);
  line-height: 1.6;
}

.catalogo {
  padding-bottom: 56px;
}

.catalogo-topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.catalogo-topo h2 {
  margin-bottom: 4px;
  font-size: 24px;
}

.catalogo-topo p {
  margin-top: 0;
  font-size: 13px;
}

.busca {
  display: flex;
  width: min(360px, 100%);
  overflow: hidden;
  background: #1a1a1a;
  border: 1px solid #444;
  border-radius: 8px;
}

.busca:focus-within {
  outline: 2px solid var(--destaque);
  outline-offset: 2px;
}

.busca input {
  width: 100%;
  min-width: 0;
  padding: 12px;
  color: white;
  background: transparent;
  border: 0;
  outline: 0;
}

.busca button {
  width: 46px;
  flex-shrink: 0;
  background: transparent;
  border: 0;
}

.busca button img {
  width: 20px;
  height: 20px;
}

.galeria {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 26px 20px;
}

.filme {
  min-width: 0;
}

.capa-container {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 10;
  background: #252525;
  border-radius: 10px;
}

.capa {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter .18s ease;
}

.filme:hover .capa {
  filter: brightness(.65);
}

.detalhes-capa {
  position: absolute;
  inset: auto 0 0;
  padding: 30px 14px 14px;
  background: linear-gradient(transparent, rgb(0 0 0 / 90%));
  opacity: 0;
  pointer-events: none;
  transition: opacity .18s ease;
}

.filme:hover .detalhes-capa,
.filme:focus-within .detalhes-capa {
  opacity: 1;
}

.detalhes-capa p {
  margin: 4px 0 0;
  font-size: 13px;
}

.filme h3 {
  margin: 13px 0 8px;
  font-size: 16px;
  overflow-wrap: anywhere;
}

.filme-rodape, .curtidas {
  display: flex;
  align-items: center;
}

.filme-rodape {
  justify-content: space-between;
  gap: 10px;
  color: var(--texto-secundario);
  font-size: 13px;
}

.curtidas {
  gap: 7px;
}

.curtidas img {
  width: 18px;
  height: 18px;
}

.mensagem, .erro-login {
  padding: 12px;
  color: #ffb5b9;
  background: #301719;
  border-radius: 7px;
}

.mensagem {
  margin: 16px 0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.rodape {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 24px 5%;
  background: #080808;
  border-top: 1px solid #292929;
}

.rodape p {
  color: #999;
  font-size: 12px;
  text-align: right;
}

.modal-login {
  width: min(420px, calc(100% - 32px));
  padding: 24px;
  color: #f5f5f5;
  background: #191919;
  border: 1px solid #383838;
  border-radius: 14px;
}

.modal-login::backdrop {
  background: rgb(0 0 0 / 75%);
}

.modal-topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
}

.modal-topo h2 {
  margin: 0;
  font-size: 24px;
}

.btn-fechar {
  width: 36px;
  height: 36px;
  color: white;
  background: #292929;
  border: 0;
  border-radius: 7px;
  font-size: 26px;
}

.modal-login label {
  display: block;
  margin: 16px 0 8px;
  font-size: 14px;
}

.modal-login input {
  width: 100%;
  padding: 12px;
  color: white;
  background: #101010;
  border: 1px solid #444;
  border-radius: 7px;
}

.modal-login input:focus {
  outline: 2px solid var(--destaque);
  outline-offset: 1px;
}

.modal-acoes {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}

.modal-acoes button {
  padding: 11px 16px;
  color: white;
  border: 1px solid #444;
  border-radius: 7px;
}

.btn-cancelar {
  background: #292929;
}

.btn-confirmar {
  background: var(--destaque);
  border-color: var(--destaque);
}

.erro-login {
  font-size: 13px;
}

@media (max-width: 760px) {
  .cabecalho {
    align-items: flex-start;
  }

  .usuario {
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .usuario #nomeUsuario {
    display: none;
  }

  .catalogo-topo {
    align-items: stretch;
    flex-direction: column;
  }

  .busca {
    width: 100%;
  }

  .galeria {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 22px 14px;
  }

  .rodape {
    align-items: flex-start;
    flex-direction: column;
  }

  .rodape p {
    text-align: left;
  }
}

@media (max-width: 430px) {
  .galeria {
    grid-template-columns: 1fr;
  }

  .introducao {
    padding-top: 36px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    transition-duration: .01ms !important;
  }
}


```

# ARQUIVO: public\index.html

```

<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#101010">
  <title>StreamFlix</title>
  <link rel="stylesheet" href="/css/style.css">
  <script src="/js/app.js" defer></script>
</head>
<body>
  <header class="cabecalho">
    <a class="logo" href="/" aria-label="StreamFlix - inÃ­cio">
      Stream<span>Flix</span>
    </a>

    <div class="usuario">
      <img
        id="avatarUsuario"
        class="avatar"
        src="/imagens/perfil/goku.png"
        alt=""
      >
      <span id="nomeUsuario">@StreamFlix</span>
      <button id="btnPerfil" type="button" disabled>
        Ver Perfil
      </button>
      <button id="btnLogin" type="button">Entrar</button>
    </div>
  </header>

  <main class="conteudo">
    <section class="introducao">
      <p class="sobretitulo">SEU UNIVERSO DE FILMES</p>
      <h1>Descubra seu prÃ³ximo filme.</h1>
      <p class="descricao">
        Explore o catÃ¡logo, conheÃ§a os curadores e compartilhe seus favoritos.
      </p>
    </section>

    <section class="catalogo" aria-labelledby="tituloCatalogo">
      <div class="catalogo-topo">
        <div>
          <h2 id="tituloCatalogo">CatÃ¡logo</h2>
          <p id="statusCatalogo" role="status">Carregando filmes...</p>
        </div>

        <form id="formBusca" class="busca">
          <label class="sr-only" for="campoBusca">
            Buscar administrador
          </label>
          <input
            id="campoBusca"
            type="search"
            placeholder="Digite o nome do administrador"
            autocomplete="off"
          >
          <button type="submit" aria-label="Buscar administrador">
            <img src="/icons/lupa.svg" alt="">
          </button>
        </form>
      </div>

      <div id="mensagem" class="mensagem" role="status" hidden></div>
      <div id="galeria" class="galeria"></div>
    </section>
  </main>

  <footer class="rodape">
    <a class="logo" href="/">Stream<span>Flix</span></a>
    <p>Â© 2026â€“2027 StreamFlix. Todos os direitos reservados.</p>
  </footer>
  
<dialog id="modalLogin" class="modal-login" aria-labelledby="tituloLogin">
  <div class="modal-topo">
    <h2 id="tituloLogin">Login</h2>

    <button
      id="btnFecharLogin"
      class="btn-fechar"
      type="button"
      aria-label="Fechar login"
    >Ã—</button>
  </div>

  <form id="formLogin">
    <label for="loginUsuario">Nome de usuÃ¡rio</label>
    <input
      id="loginUsuario"
      name="nome_usuario"
      type="text"
      minlength="3"
      maxlength="50"
      autocomplete="username"
      required
    >

    <label for="loginSenha">Senha</label>
    <input
      id="loginSenha"
      name="senha"
      type="password"
      maxlength="200"
      autocomplete="current-password"
      required
    >

    <p id="erroLogin" class="erro-login" role="alert" hidden></p>

    <div class="modal-acoes">
      <button id="btnCancelarLogin" type="button" class="btn-cancelar">
        Cancelar
      </button>

      <button id="btnEnviarLogin" type="submit" class="btn-confirmar">
        Entrar
      </button>
    </div>
  </form>
</dialog>

</body>
</html>

```

# ARQUIVO: public\js\app.js

```

const galeria = document.querySelector("#galeria");
const statusCatalogo = document.querySelector("#statusCatalogo");
const mensagem = document.querySelector("#mensagem");
const formBusca = document.querySelector("#formBusca");
const campoBusca = document.querySelector("#campoBusca");

function mostrarMensagem(texto) {
  mensagem.textContent = texto;
  mensagem.hidden = !texto;
}

function criarFilme(filme) {
  const artigo = document.createElement("article");
  artigo.className = "filme";

  const containerCapa = document.createElement("div");
  containerCapa.className = "capa-container";

  const imagem = document.createElement("img");
  imagem.className = "capa";
  imagem.src = filme.url_capa;
  imagem.alt = `Capa de ${filme.titulo_filme}`;
  imagem.loading = "lazy";

  imagem.onerror = () => {
    imagem.alt = "Capa indisponÃ­vel";
    imagem.removeAttribute("src");
  };

  const detalhes = document.createElement("div");
  detalhes.className = "detalhes-capa";

  const administrador = document.createElement("p");
  administrador.textContent = `Cadastrado por: @${filme.administrador}`;

  const genero = document.createElement("p");
  genero.textContent = filme.genero;

  detalhes.append(administrador, genero);
  containerCapa.append(imagem, detalhes);

  const titulo = document.createElement("h3");
  titulo.textContent = filme.titulo_filme;

  const rodape = document.createElement("div");
  rodape.className = "filme-rodape";

  const botaoCurtir = document.createElement("button");
  botaoCurtir.type = "button";
  botaoCurtir.className = "curtidas btn-curtir";
  botaoCurtir.dataset.filmeId = String(filme.id_filme);
  botaoCurtir.setAttribute(
    "aria-label",
    `Curtir ${filme.titulo_filme}`
  );

  const icone = document.createElement("img");
  icone.src = "/icons/coracao.svg";
  icone.alt = "";
  icone.setAttribute("aria-hidden", "true");

  const quantidade = document.createElement("span");
  quantidade.className = "quantidade-curtidas";
  quantidade.textContent = String(filme.total_curtidas);

  botaoCurtir.append(icone, quantidade);
  rodape.append(botaoCurtir);

  artigo.append(containerCapa, titulo, rodape);

  return artigo;
}

// Carrega o catÃ¡logo completo ou os filmes correspondentes Ã  busca.
async function carregarFilmes(busca = "") {
  galeria.replaceChildren();

  statusCatalogo.textContent = busca
    ? "Pesquisando filmes..."
    : "Carregando filmes...";

  mostrarMensagem("");

  try {
    const parametros = new URLSearchParams();

    if (busca) {
      parametros.set("busca", busca);
    }

    const url = parametros.toString()
      ? `/api/filmes?${parametros.toString()}`
      : "/api/filmes";

    const resposta = await fetch(url, {
      credentials: "same-origin",
    });

    if (!resposta.ok) {
      throw new Error("Falha ao consultar a API.");
    }

    const dados = await resposta.json();

    if (!Array.isArray(dados.filmes)) {
      throw new Error("Formato de resposta invÃ¡lido.");
    }

    if (dados.filmes.length === 0) {
      statusCatalogo.textContent = busca
        ? "Nenhum filme encontrado para essa busca."
        : "Nenhum filme cadastrado.";

      return;
    }

    const fragmento = document.createDocumentFragment();

    for (const filme of dados.filmes) {
      fragmento.append(criarFilme(filme));
    }

    galeria.append(fragmento);

    statusCatalogo.textContent = busca
      ? `${dados.filmes.length} filme(s) encontrado(s)`
      : `${dados.filmes.length} filme(s) no catÃ¡logo`;
  } catch (erro) {
    console.error("Erro ao carregar o catÃ¡logo:", erro);

    statusCatalogo.textContent =
      "NÃ£o foi possÃ­vel carregar o catÃ¡logo.";

    mostrarMensagem(
      "Verifique a conexÃ£o com o servidor e tente novamente."
    );
  }
}

// Pesquisa por tÃ­tulo ou gÃªnero.
if (formBusca && campoBusca) {
  formBusca.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const busca = campoBusca.value.trim();

    carregarFilmes(busca);
  });
}

// Registra ou remove curtidas.
galeria.addEventListener("click", async (evento) => {
  const botao = evento.target.closest(".btn-curtir");

  if (!botao || !galeria.contains(botao)) {
    return;
  }

  if (botao.disabled) {
    return;
  }

  const idFilme = botao.dataset.filmeId;
  const quantidade = botao.querySelector(".quantidade-curtidas");

  if (!idFilme || !quantidade) {
    return;
  }

  botao.disabled = true;

  try {
    const resposta = await fetch(
      `/api/filmes/${encodeURIComponent(idFilme)}/curtida`,
      {
        method: "POST",
        credentials: "same-origin",
      }
    );

    const dados = await resposta.json();

    if (resposta.status === 401) {
      mostrarMensagem("Entre na sua conta para curtir um filme.");
      return;
    }

    if (!resposta.ok) {
      throw new Error(
        dados.erro || "NÃ£o foi possÃ­vel curtir o filme."
      );
    }

    const totalAtual = Number(quantidade.textContent);

    quantidade.textContent = String(
      totalAtual + (dados.curtido ? 1 : -1)
    );

    mostrarMensagem(dados.mensagem);
  } catch (erro) {
    console.error("Erro ao curtir filme:", erro);

    mostrarMensagem(
      erro.message || "Erro ao registrar a curtida."
    );
  } finally {
    botao.disabled = false;
  }
});

// Inicializa o catÃ¡logo.
carregarFilmes();

/* ========================================
   AUTENTICAÃ‡ÃƒO DO STREAMFLIX
   ======================================== */

(() => {
  const modal = document.querySelector("#modalLogin");
  const form = document.querySelector("#formLogin");
  const campoUsuario = document.querySelector("#loginUsuario");
  const campoSenha = document.querySelector("#loginSenha");
  const erroLogin = document.querySelector("#erroLogin");
  const botaoEntrar = document.querySelector("#btnLogin");
  const botaoPerfil = document.querySelector("#btnPerfil");
  const nomeUsuario = document.querySelector("#nomeUsuario");
  const avatarUsuario = document.querySelector("#avatarUsuario");

  if (
    !modal ||
    !form ||
    !campoUsuario ||
    !campoSenha ||
    !erroLogin ||
    !botaoEntrar
  ) {
    console.error("Elementos do modal de login nÃ£o encontrados.");
    return;
  }

  // Cria o botÃ£o de sair sem precisar reestruturar o HTML.
  const botaoSair = document.createElement("button");
  botaoSair.id = "btnLogout";
  botaoSair.type = "button";
  botaoSair.textContent = "Sair";
  botaoSair.hidden = true;

  botaoEntrar.insertAdjacentElement("afterend", botaoSair);

  function mostrarErro(texto) {
    erroLogin.textContent = texto;
    erroLogin.hidden = !texto;
  }

  function abrirModal() {
    mostrarErro("");
    form.reset();
    modal.showModal();
    campoUsuario.focus();
  }

  function atualizarUsuario(usuario) {
    if (!usuario) {
      if (nomeUsuario) {
        nomeUsuario.textContent = "@StreamFlix";
      }

      if (avatarUsuario) {
        avatarUsuario.src = "/imagens/perfil/goku.png";
        avatarUsuario.alt = "Perfil padrÃ£o";
      }

      botaoEntrar.hidden = false;
      botaoSair.hidden = true;

      if (botaoPerfil) {
        botaoPerfil.disabled = true;
      }

      return;
    }

    if (nomeUsuario) {
      nomeUsuario.textContent = `@${usuario.nome_usuario}`;
    }

    if (avatarUsuario) {
      const arquivo = String(usuario.imagem_usuario || "")
        .split(/[\\/]/)
        .pop();

      avatarUsuario.src = arquivo
        ? `/imagens/perfil/${encodeURIComponent(arquivo)}`
        : "/imagens/perfil/goku.png";

      avatarUsuario.alt = `Foto de ${usuario.nome}`;
    }

    botaoEntrar.hidden = true;
    botaoSair.hidden = false;

    if (botaoPerfil) {
      botaoPerfil.disabled = usuario.tipo !== "administrador";
    }
  }

  botaoEntrar.addEventListener("click", abrirModal);

  document
    .querySelector("#btnFecharLogin")
    ?.addEventListener("click", () => modal.close());

  document
    .querySelector("#btnCancelarLogin")
    ?.addEventListener("click", () => modal.close());

  modal.addEventListener("close", () => {
    mostrarErro("");
    form.reset();
  });

  modal.addEventListener("click", (evento) => {
    if (evento.target === modal) {
      modal.close();
    }
  });

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    mostrarErro("");

    botaoEntrar.disabled = true;

    const botaoEnviar = document.querySelector("#btnEnviarLogin");

    if (botaoEnviar) {
      botaoEnviar.disabled = true;
      botaoEnviar.textContent = "Entrando...";
    }

    try {
      const resposta = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          nome_usuario: campoUsuario.value.trim(),
          senha: campoSenha.value,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        mostrarErro(
          dados.erro || "NÃ£o foi possÃ­vel realizar o login."
        );

        return;
      }

      atualizarUsuario(dados.usuario);
      modal.close();

      mostrarMensagem(`Bem-vindo(a), ${dados.usuario.nome}!`);
    } catch (erro) {
      console.error("Erro ao realizar login:", erro);
      mostrarErro("Falha de conexÃ£o. Tente novamente.");
    } finally {
      botaoEntrar.disabled = false;

      if (botaoEnviar) {
        botaoEnviar.disabled = false;
        botaoEnviar.textContent = "Entrar";
      }
    }
  });

  botaoSair.addEventListener("click", async () => {
    botaoSair.disabled = true;

    try {
      const resposta = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });

      if (!resposta.ok) {
        throw new Error("Falha ao encerrar a sessÃ£o.");
      }

      atualizarUsuario(null);
      mostrarMensagem("VocÃª saiu da sua conta.");
    } catch (erro) {
      console.error("Erro ao sair:", erro);

      mostrarMensagem(
        "NÃ£o foi possÃ­vel sair. Tente novamente."
      );
    } finally {
      botaoSair.disabled = false;
    }
  });

  // Recupera a sessÃ£o caso o usuÃ¡rio atualize a pÃ¡gina.
  async function verificarSessao() {
    try {
      const resposta = await fetch("/api/auth/me", {
        credentials: "same-origin",
      });

      if (resposta.status === 401) {
        atualizarUsuario(null);
        return;
      }

      if (!resposta.ok) {
        throw new Error("Falha ao verificar sessÃ£o.");
      }

      const dados = await resposta.json();
      atualizarUsuario(dados.usuario);
    } catch (erro) {
      console.error("Erro ao verificar sessÃ£o:", erro);
    }
  }

  verificarSessao();
})();

```

# ARQUIVO: sql\streamflix_DaviPessoaTorres.sql

```

-- STREAMFLIX
-- Estrutura inicial do banco de dados PostgreSQL

CREATE TABLE IF NOT EXISTS tb_usuario (
    id_usuario INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    nome_usuario VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    imagem_usuario VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL
        CHECK (tipo IN ('usuario', 'administrador')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tb_filme (
    id_filme INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titulo_filme VARCHAR(150) NOT NULL,
    genero VARCHAR(80) NOT NULL,
    id_usuario INTEGER NOT NULL,
    url_capa VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_filme_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES tb_usuario(id_usuario)
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS tb_curtida (
    id_curtida INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    id_filme INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_curtida_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES tb_usuario(id_usuario)
        ON DELETE CASCADE,

    CONSTRAINT fk_curtida_filme
        FOREIGN KEY (id_filme)
        REFERENCES tb_filme(id_filme)
        ON DELETE CASCADE,

    CONSTRAINT uq_curtida_usuario_filme
        UNIQUE (id_usuario, id_filme)
);

-- Ãndices para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_filme_usuario
    ON tb_filme(id_usuario);

CREATE INDEX IF NOT EXISTS idx_curtida_filme
    ON tb_curtida(id_filme);

CREATE INDEX IF NOT EXISTS idx_curtida_usuario
    ON tb_curtida(id_usuario);

```

# ARQUIVO: src\config\database.js

```

const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (error) => {
  console.error("Erro inesperado no pool do PostgreSQL:", error.message);
});

module.exports = pool;

```

# ARQUIVO: src\importar-usuarios.js

```

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
      throw new Error(`Arquivo CSV nÃ£o encontrado: ${caminhoCSV}`);
    }

    const conteudo = fs
      .readFileSync(caminhoCSV, "utf8")
      .replace(/^\uFEFF/, "")
      .trim();

    const linhas = conteudo
      .split(/\r?\n/)
      .filter((linha) => linha.trim() !== "");

    if (linhas.length < 2) {
      throw new Error("O CSV nÃ£o contÃ©m usuÃ¡rios para importar.");
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
      throw new Error("O cabeÃ§alho do CSV estÃ¡ diferente do esperado.");
    }

    const usuarios = linhas.slice(1).map((linha, indice) => {
      const campos = linha.split(",").map((campo) => campo.trim());

      if (campos.length !== cabecalhoEsperado.length) {
        throw new Error(
          `Quantidade de campos invÃ¡lida na linha ${indice + 2}.`
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
        throw new Error(`Campo obrigatÃ³rio vazio na linha ${indice + 2}.`);
      }

      if (!/^[a-zA-Z0-9_]{3,50}$/.test(nome_usuario)) {
        throw new Error(
          `Nome de usuÃ¡rio invÃ¡lido na linha ${indice + 2}.`
        );
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error(`E-mail invÃ¡lido na linha ${indice + 2}.`);
      }

      if (!["usuario", "administrador"].includes(tipo)) {
        throw new Error(`Tipo de conta invÃ¡lido na linha ${indice + 2}.`);
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

    // Evita duplicaÃ§Ãµes dentro do prÃ³prio arquivo.
    const nomes = usuarios.map((u) => u.nome_usuario.toLowerCase());
    const emails = usuarios.map((u) => u.email.toLowerCase());

    if (new Set(nomes).size !== nomes.length) {
      throw new Error("Existem nomes de usuÃ¡rio duplicados no CSV.");
    }

    if (new Set(emails).size !== emails.length) {
      throw new Error("Existem e-mails duplicados no CSV.");
    }

    // Calcula os hashes antes de iniciar a transaÃ§Ã£o.
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

    console.log(`ImportaÃ§Ã£o concluÃ­da: ${usuarios.length} usuÃ¡rios processados.`);
    console.log("As senhas foram armazenadas usando hash bcrypt.");
  } catch (erro) {
    if (client) {
      await client.query("ROLLBACK").catch(() => {});
    }

    console.error("Falha na importaÃ§Ã£o:", erro.message);
    process.exitCode = 1;
  } finally {
    client?.release();
    await pool.end();
  }
}

importarUsuarios();

```

# ARQUIVO: src\middleware\autenticacao.js

```

function exigirLogin(req, res, next) {
  if (!req.session || !req.session.usuario) {
    return res.status(401).json({
      erro: "FaÃ§a login para continuar.",
    });
  }

  next();
}

function exigirAdministrador(req, res, next) {
  if (!req.session || !req.session.usuario) {
    return res.status(401).json({
      erro: "FaÃ§a login para continuar.",
    });
  }

  if (req.session.usuario.tipo !== "administrador") {
    return res.status(403).json({
      erro: "Acesso permitido apenas para administradores.",
    });
  }

  next();
}

module.exports = {
  exigirLogin,
  exigirAdministrador,
};

```

# ARQUIVO: src\routes\autenticacao.js

```

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
        erro: "Informe um usuÃ¡rio e uma senha vÃ¡lidos.",
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
        erro: "UsuÃ¡rio nÃ£o encontrado ou senha incorreta.",
      });
    }

    // Troca o identificador da sessÃ£o apÃ³s autenticar.
    req.session.regenerate((erro) => {
      if (erro) {
        return res.status(500).json({
          erro: "NÃ£o foi possÃ­vel iniciar a sessÃ£o.",
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
            erro: "NÃ£o foi possÃ­vel salvar a sessÃ£o.",
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
        erro: "NÃ£o foi possÃ­vel encerrar a sessÃ£o.",
      });
    }

    res.clearCookie("streamflix.sid");
    return res.json({ mensagem: "Logout realizado com sucesso." });
  });
});

module.exports = router;

```

# ARQUIVO: src\routes\Davi.js

```

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
      erro: "NÃ£o foi possÃ­vel carregar os filmes.",
    });
  }
});

// Curte ou remove a curtida de um filme.
router.post("/:id/curtida", exigirLogin, async (req, res) => {
  const idFilme = Number(req.params.id);
  const idUsuario = req.session.usuario.id_usuario;

  if (!Number.isInteger(idFilme) || idFilme <= 0) {
    return res.status(400).json({
      erro: "ID de filme invÃ¡lido.",
    });
  }

  try {
    // Se a curtida nÃ£o existir, registra.
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

    // Se jÃ¡ existir, remove a curtida.
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
      erro: "NÃ£o foi possÃ­vel registrar a curtida.",
    });
  }
});

module.exports = router;

```

# ARQUIVO: src\server.js

```

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
      banco: "indisponÃ­vel",
    });
  }
});

// Os arquivos pÃºblicos serÃ£o servidos nesta pasta.
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
  res.status(404).json({ erro: "Rota nÃ£o encontrada." });
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

```

# ARQUIVO: src\teste-banco.js

```

const pool = require("./config/database");

async function testarConexao() {
  try {
    const resultado = await pool.query(`
      SELECT
        current_user AS usuario,
        current_database() AS banco,
        inet_server_port() AS porta
    `);

    console.log("ConexÃ£o com PostgreSQL realizada!"); 
    console.table(resultado.rows);
  } catch (erro) {
    console.error("Falha na conexÃ£o:", erro.message);
  } finally {
    await pool.end();
  }
}

testarConexao();

```
