
'use strict';

const usuariosBD = [
    {
        id: 1,
        nome: 'Usuário Comum',
        username: '@usuario1',
        email: 'comum@saep.com',
        senha: '123',
        tipo: 'comum',
        foto: '/img/default.jpg'
    },
    {
        id: 2,
        nome: 'Carlos Fotógrafo',
        username: '@fotografo1',
        email: 'foto1@saep.com',
        senha: '123',
        tipo: 'fotografo',
        foto: '/img/default.jpg'
    }
];

let publicacoesBD = [
    {
        id: 1,
        titulo: 'Dedo de Deus',
        fonte: 'Rio de Janeiro',
        fotografoId: 2,
        fotografoUsername: '@fotografo1',
        imagem: null,
        curtidas: [1]
    },
    {
        id: 2,
        titulo: 'Pôr do Sol',
        fonte: 'Salvador',
        fotografoId: 2,
        fotografoUsername: '@fotografo1',
        imagem: null,
        curtidas: []
    },
    {
        id: 3,
        titulo: 'Paisagem Natural',
        fonte: 'Brasil',
        fotografoId: 2,
        fotografoUsername: '@fotografo1',
        imagem: null,
        curtidas: []
    }
];

let usuarioLogado = null;
let termoBuscaAtual = '';
let proximoIdPublicacao = 4;

const galeria = document.getElementById('galeria-fotos');
const modalLogin = document.getElementById('modal-login');
const formularioLogin = document.getElementById('form-login');
const btnAuth = document.getElementById('btn-auth');
const btnVerPerfil = document.getElementById('btn-ver-perfil');
const menuFotografo = document.getElementById('menu-fotografo');
const sobreposicaoMenu = document.getElementById('sobreposicao-menu');
const inputBusca = document.getElementById('input-busca');
const mensagemErroBusca = document.getElementById('msg-busca-erro');
const galeriaVazia = document.getElementById('galeria-vazia');
const secaoCadastroFoto = document.getElementById('secao-cadastro-foto');
const formularioCadastroFoto = document.getElementById('form-cadastro-foto');
const fotoUsuario = document.getElementById('foto-usuario');
const avatarFallback = document.getElementById('avatar-fallback');

const iconeFotografia = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2"></rect>
        <circle cx="8.5" cy="9" r="1.5"></circle>
        <path d="m21 15-5-5L5 20"></path>
    </svg>
`;

document.addEventListener('DOMContentLoaded', inicializar);

function inicializar() {
    configurarEventos();
    configurarImagemPerfil();
    carregarGaleria(publicacoesBD);
    atualizarInterfaceUsuario();
}

function configurarEventos() {
    btnAuth.addEventListener('click', () => {
        if (usuarioLogado) {
            efetuarLogout();
            return;
        }

        abrirModalLogin();
    });

    document.getElementById('btn-fechar-modal')
        .addEventListener('click', fecharModalLogin);

    document.getElementById('btn-cancelar-login')
        .addEventListener('click', fecharModalLogin);

    modalLogin.addEventListener('click', (evento) => {
        if (evento.target === modalLogin) {
            fecharModalLogin();
        }
    });

    document.addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape') {
            fecharModalLogin();
            fecharMenuFotografo();
        }
    });

    formularioLogin.addEventListener('submit', efetuarLogin);

    document.getElementById('btn-buscar')
        .addEventListener('click', executarBusca);

    inputBusca.addEventListener('keydown', (evento) => {
        if (evento.key === 'Enter') {
            executarBusca();
        }
    });

    document.getElementById('btn-limpar-busca')
        .addEventListener('click', limparBusca);

    document.getElementById('btn-voltar-galeria')
        .addEventListener('click', limparBusca);

    btnVerPerfil.addEventListener('click', () => {
        if (!usuarioLogado) {
            abrirModalLogin();
            return;
        }

        if (usuarioLogado.tipo === 'fotografo') {
            abrirMenuFotografo();
        }
    });

    document.getElementById('btn-fechar-menu')
        .addEventListener('click', fecharMenuFotografo);

    sobreposicaoMenu.addEventListener('click', fecharMenuFotografo);

    formularioCadastroFoto.addEventListener('submit', cadastrarFoto);
}

function configurarImagemPerfil() {
    fotoUsuario.addEventListener('error', () => {
        fotoUsuario.hidden = true;
        avatarFallback.hidden = false;
    });

    fotoUsuario.addEventListener('load', () => {
        fotoUsuario.hidden = false;
        avatarFallback.hidden = true;
    });
}

function carregarGaleria(publicacoes) {
    galeria.replaceChildren();

    publicacoes.forEach((publicacao) => {
        galeria.appendChild(criarCartaoFotografia(publicacao));
    });

    const semResultados = publicacoes.length === 0;

    galeriaVazia.hidden = !semResultados;
    galeria.hidden = semResultados;

    document.getElementById('btn-limpar-busca').hidden =
        termoBuscaAtual.length === 0;

    if (semResultados) {
        galeriaVazia.querySelector('h2').textContent =
            termoBuscaAtual
                ? 'Nenhuma publicação encontrada'
                : 'Nenhuma fotografia por aqui';

        galeriaVazia.querySelector('p').textContent =
            termoBuscaAtual
                ? 'Tente pesquisar por outro fotógrafo.'
                : 'As publicações aparecerão aqui quando estiverem disponíveis.';
    }
}

function criarCartaoFotografia(publicacao) {
    const card = document.createElement('article');
    card.className = 'card-foto';

    const containerImagem = document.createElement('div');
    containerImagem.className = 'container-imagem';

    const placeholder = document.createElement('div');
    placeholder.className = 'imagem-placeholder';
    placeholder.innerHTML = iconeFotografia;

    const textoPlaceholder = document.createElement('span');
    textoPlaceholder.textContent = 'Prévia da fotografia';
    placeholder.appendChild(textoPlaceholder);

    containerImagem.appendChild(placeholder);

    if (publicacao.imagem) {
        const imagem = document.createElement('img');
        imagem.className = 'imagem-publicacao';
        imagem.alt = publicacao.titulo;
        const caminhoImagem = publicacao.imagem;

        imagem.src = caminhoImagem.startsWith('/img/')
            ? caminhoImagem
            : `/img/${caminhoImagem.replace(/^.*[\\/]/, '')}`;
        imagem.addEventListener('load', () => {
            placeholder.hidden = true;
        });

        imagem.addEventListener('error', () => {
            imagem.remove();
            placeholder.hidden = false;
        });

        containerImagem.appendChild(imagem);
    }

    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = `Local: ${publicacao.fonte}`;
    containerImagem.appendChild(tooltip);

    const informacoes = document.createElement('div');
    informacoes.className = 'info-foto';

    const titulo = document.createElement('h3');
    titulo.textContent = publicacao.titulo;

    const autor = document.createElement('p');
    autor.className = 'autor-foto';
    autor.textContent = `Fotografia de ${publicacao.fotografoUsername}`;

    const detalhes = document.createElement('div');
    detalhes.className = 'detalhes-foto';

    const local = document.createElement('span');
    local.className = 'local-foto';
    local.textContent = publicacao.fonte;

    const botaoCurtida = document.createElement('button');
    botaoCurtida.type = 'button';
    botaoCurtida.className = 'btn-curtida';

    const jaCurtido = Boolean(
        usuarioLogado &&
        publicacao.curtidas.includes(usuarioLogado.id)
    );

    botaoCurtida.setAttribute('aria-pressed', String(jaCurtido));
    botaoCurtida.setAttribute(
        'aria-label',
        jaCurtido ? 'Remover curtida' : 'Curtir fotografia'
    );

    const iconeCoracao = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg'
    );

    iconeCoracao.setAttribute('viewBox', '0 0 24 24');
    iconeCoracao.setAttribute('aria-hidden', 'true');

    const caminhoCoracao = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path'
    );

    caminhoCoracao.setAttribute(
        'd',
        'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z'
    );

    iconeCoracao.appendChild(caminhoCoracao);

    const quantidadeCurtidas = document.createElement('span');
    quantidadeCurtidas.textContent = String(publicacao.curtidas.length);

    botaoCurtida.append(iconeCoracao, quantidadeCurtidas);

    botaoCurtida.addEventListener('click', () => {
        interagirCurtida(publicacao.id);
    });

    detalhes.append(local, botaoCurtida);
    informacoes.append(titulo, autor, detalhes);
    card.append(containerImagem, informacoes);

    return card;
}

function abrirModalLogin() {
    modalLogin.hidden = false;
    document.getElementById('erro-credenciais').hidden = true;
    document.getElementById('login-email').focus();
}

function fecharModalLogin() {
    modalLogin.hidden = true;
    document.getElementById('erro-credenciais').hidden = true;
}

function efetuarLogin(evento) {
    evento.preventDefault();

    const email = document.getElementById('login-email')
        .value.trim().toLowerCase();

    const senha = document.getElementById('login-senha').value;

    const usuario = usuariosBD.find((item) =>
        item.email.toLowerCase() === email && item.senha === senha
    );

    if (!usuario) {
        document.getElementById('erro-credenciais').hidden = false;
        return;
    }

    usuarioLogado = usuario;

    formularioLogin.reset();
    fecharModalLogin();
    atualizarInterfaceUsuario();
    carregarGaleria(obterPublicacoesFiltradas());
}

function atualizarInterfaceUsuario() {
    if (usuarioLogado) {
        document.getElementById('nome-usuario').textContent =
            usuarioLogado.username;

        fotoUsuario.alt = `Foto de perfil de ${usuarioLogado.username}`;
        fotoUsuario.src = usuarioLogado.foto;
        avatarFallback.textContent =
            usuarioLogado.username.replace('@', '').charAt(0).toUpperCase();

        btnAuth.textContent = 'Sair';
        btnVerPerfil.disabled = usuarioLogado.tipo !== 'fotografo';

        secaoCadastroFoto.hidden = usuarioLogado.tipo !== 'fotografo';
    } else {
        document.getElementById('nome-usuario').textContent = '@SAEPVision';

        fotoUsuario.alt = 'Foto do perfil SAEPVision';
        fotoUsuario.src = '/img/default.jpg';
        avatarFallback.textContent = 'S';

        btnAuth.textContent = 'Login';
        btnVerPerfil.disabled = true;
        secaoCadastroFoto.hidden = true;

        fecharMenuFotografo();
    }

    carregarGaleria(obterPublicacoesFiltradas());
}

function efetuarLogout() {
    usuarioLogado = null;
    termoBuscaAtual = '';
    inputBusca.value = '';
    mensagemErroBusca.hidden = true;

    atualizarInterfaceUsuario();
}

function interagirCurtida(publicacaoId) {
    if (!usuarioLogado) {
        abrirModalLogin();
        return;
    }

    const publicacao = publicacoesBD.find(
        (item) => item.id === publicacaoId
    );

    if (!publicacao) {
        return;
    }

    const indice = publicacao.curtidas.indexOf(usuarioLogado.id);

    if (indice === -1) {
        publicacao.curtidas.push(usuarioLogado.id);
    } else {
        publicacao.curtidas.splice(indice, 1);
    }

    carregarGaleria(obterPublicacoesFiltradas());

    if (menuFotografo.classList.contains('ativo')) {
        atualizarMenuFotografo();
    }
}

function executarBusca() {
    if (!usuarioLogado) {
        abrirModalLogin();
        return;
    }

    termoBuscaAtual = inputBusca.value.trim();
    mensagemErroBusca.hidden = true;

    carregarGaleria(obterPublicacoesFiltradas());
}

function obterPublicacoesFiltradas() {
    if (!termoBuscaAtual) {
        return publicacoesBD;
    }

    const termo = termoBuscaAtual.toLocaleLowerCase('pt-BR');

    return publicacoesBD.filter((publicacao) =>
        publicacao.fotografoUsername
            .toLocaleLowerCase('pt-BR')
            .includes(termo)
    );
}

function limparBusca() {
    termoBuscaAtual = '';
    inputBusca.value = '';
    mensagemErroBusca.hidden = true;

    carregarGaleria(publicacoesBD);
}

function abrirMenuFotografo() {
    if (!usuarioLogado || usuarioLogado.tipo !== 'fotografo') {
        return;
    }

    atualizarMenuFotografo();

    menuFotografo.classList.add('ativo');
    menuFotografo.setAttribute('aria-hidden', 'false');
    sobreposicaoMenu.hidden = false;

    document.body.style.overflow = 'hidden';
}

function fecharMenuFotografo() {
    menuFotografo.classList.remove('ativo');
    menuFotografo.setAttribute('aria-hidden', 'true');
    sobreposicaoMenu.hidden = true;

    document.body.style.overflow = '';
}

function atualizarMenuFotografo() {
    if (!usuarioLogado || usuarioLogado.tipo !== 'fotografo') {
        return;
    }

    document.getElementById('menu-nome-fotografo').textContent =
        usuarioLogado.username;

    const minhasPublicacoes = publicacoesBD.filter(
        (publicacao) => publicacao.fotografoId === usuarioLogado.id
    );

    const totalCurtidas = minhasPublicacoes.reduce(
        (total, publicacao) => total + publicacao.curtidas.length,
        0
    );

    document.getElementById('total-likes').textContent =
        String(totalCurtidas);

    document.getElementById('total-publicacoes').textContent =
        String(minhasPublicacoes.length);

    const lista = document.getElementById('lista-suas-publicacoes');
    const mensagemVazia = document.getElementById('lista-publicacoes-vazia');

    lista.replaceChildren();
    mensagemVazia.hidden = minhasPublicacoes.length > 0;

    minhasPublicacoes.forEach((publicacao) => {
        const item = document.createElement('li');
        item.className = 'item-publicacao';

        const titulo = document.createElement('span');
        titulo.textContent = publicacao.titulo;

        const botaoExcluir = document.createElement('button');
        botaoExcluir.type = 'button';
        botaoExcluir.className = 'btn-excluir';
        botaoExcluir.textContent = 'Excluir';
        botaoExcluir.setAttribute(
            'aria-label',
            `Excluir publicação ${publicacao.titulo}`
        );

        botaoExcluir.addEventListener('click', () => {
            excluirPublicacao(publicacao.id);
        });

        item.append(titulo, botaoExcluir);
        lista.appendChild(item);
    });
}

function excluirPublicacao(publicacaoId) {
    if (!usuarioLogado || usuarioLogado.tipo !== 'fotografo') {
        return;
    }

    const publicacao = publicacoesBD.find(
        (item) => item.id === publicacaoId
    );

    if (!publicacao || publicacao.fotografoId !== usuarioLogado.id) {
        return;
    }

    if (publicacao.imagem?.startsWith('blob:')) {
        URL.revokeObjectURL(publicacao.imagem);
    }

    publicacoesBD = publicacoesBD.filter(
        (item) => item.id !== publicacaoId
    );

    carregarGaleria(obterPublicacoesFiltradas());
    atualizarMenuFotografo();
}

function cadastrarFoto(evento) {
    evento.preventDefault();

    const erroCadastro = document.getElementById('erro-cadastro-foto');

    erroCadastro.hidden = true;
    erroCadastro.textContent = '';

    if (!usuarioLogado || usuarioLogado.tipo !== 'fotografo') {
        erroCadastro.textContent =
            'Somente fotógrafos autenticados podem publicar fotografias.';
        erroCadastro.hidden = false;
        return;
    }

    const titulo = document.getElementById('titulo-imagem')
        .value.trim();

    const fonte = document.getElementById('fonte-origem')
        .value.trim();

    const arquivo = document.getElementById('arquivo-imagem')
        .files[0];

    if (!titulo || !fonte || !arquivo) {
        erroCadastro.textContent = 'Preencha todos os campos.';
        erroCadastro.hidden = false;
        return;
    }

    const formatosPermitidos = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif'
    ];

    if (!formatosPermitidos.includes(arquivo.type)) {
        erroCadastro.textContent =
            'Selecione uma imagem JPG, PNG, WEBP ou GIF.';
        erroCadastro.hidden = false;
        return;
    }

    const tamanhoMaximo = 10 * 1024 * 1024;

    if (arquivo.size > tamanhoMaximo) {
        erroCadastro.textContent =
            'A imagem deve ter no máximo 10 MB.';
        erroCadastro.hidden = false;
        return;
    }

    const novaPublicacao = {
        id: proximoIdPublicacao++,
        titulo,
        fonte,
        fotografoId: usuarioLogado.id,
        fotografoUsername: usuarioLogado.username,
        imagem: URL.createObjectURL(arquivo),
        curtidas: []
    };

    publicacoesBD.unshift(novaPublicacao);

    termoBuscaAtual = '';
    inputBusca.value = '';

    formularioCadastroFoto.reset();
    carregarGaleria(publicacoesBD);
    atualizarMenuFotografo();
}

