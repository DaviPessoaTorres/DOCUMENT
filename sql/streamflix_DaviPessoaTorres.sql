
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

-- Índices para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_filme_usuario
    ON tb_filme(id_usuario);

CREATE INDEX IF NOT EXISTS idx_curtida_filme
    ON tb_curtida(id_filme);

CREATE INDEX IF NOT EXISTS idx_curtida_usuario
    ON tb_curtida(id_usuario);
