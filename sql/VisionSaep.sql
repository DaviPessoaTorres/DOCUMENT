CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL DEFAULT 'comum' CHECK (tipo IN ('comum', 'fotografo')),
    foto_perfil VARCHAR(255) DEFAULT 'default.jpg'
);


CREATE TABLE publicacoes (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    fonte_origem VARCHAR(150) NOT NULL,
    imagem VARCHAR(255) NOT NULL,
    fotografo_id INT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fotografo_id) REFERENCES usuarios(id) ON DELETE CASCADE
);


CREATE TABLE curtidas (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    publicacao_id INT NOT NULL,
    data_curtida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uc_usuario_publicacao UNIQUE (usuario_id, publicacao_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (publicacao_id) REFERENCES publicacoes(id) ON DELETE CASCADE
);