
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
      throw new Error("Formato de resposta inválido.");
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
      `${dados.filmes.length} filme(s) no catálogo`;
  } catch (erro) {
    console.error("Erro ao carregar o catálogo:", erro);
    statusCatalogo.textContent = "Não foi possível carregar o catálogo.";
    mostrarMensagem("Verifique a conexão com o servidor e tente novamente.");
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
    "A busca por administrador será ativada na próxima etapa, com autenticação."
  );
});

carregarFilmes();
