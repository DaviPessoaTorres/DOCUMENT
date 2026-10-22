
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
    imagem.alt = "Capa indisponível";
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

// Carrega o catálogo completo ou os filmes correspondentes à busca.
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
      throw new Error("Formato de resposta inválido.");
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
      : `${dados.filmes.length} filme(s) no catálogo`;
  } catch (erro) {
    console.error("Erro ao carregar o catálogo:", erro);

    statusCatalogo.textContent =
      "Não foi possível carregar o catálogo.";

    mostrarMensagem(
      "Verifique a conexão com o servidor e tente novamente."
    );
  }
}

// Pesquisa por título ou gênero.
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
        dados.erro || "Não foi possível curtir o filme."
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

// Inicializa o catálogo.
carregarFilmes();

/* ========================================
   AUTENTICAÇÃO DO STREAMFLIX
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
    console.error("Elementos do modal de login não encontrados.");
    return;
  }

  // Cria o botão de sair sem precisar reestruturar o HTML.
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
        avatarUsuario.alt = "Perfil padrão";
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
          dados.erro || "Não foi possível realizar o login."
        );

        return;
      }

      atualizarUsuario(dados.usuario);
      modal.close();

      mostrarMensagem(`Bem-vindo(a), ${dados.usuario.nome}!`);
    } catch (erro) {
      console.error("Erro ao realizar login:", erro);
      mostrarErro("Falha de conexão. Tente novamente.");
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
        throw new Error("Falha ao encerrar a sessão.");
      }

      atualizarUsuario(null);
      mostrarMensagem("Você saiu da sua conta.");
    } catch (erro) {
      console.error("Erro ao sair:", erro);

      mostrarMensagem(
        "Não foi possível sair. Tente novamente."
      );
    } finally {
      botaoSair.disabled = false;
    }
  });

  // Recupera a sessão caso o usuário atualize a página.
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
        throw new Error("Falha ao verificar sessão.");
      }

      const dados = await resposta.json();
      atualizarUsuario(dados.usuario);
    } catch (erro) {
      console.error("Erro ao verificar sessão:", erro);
    }
  }

  verificarSessao();
})();
