
'use strict';

const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const multer = require('multer');
require('dotenv').config({
    path: path.resolve(__dirname, '../.env')
});

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const publicDir = path.resolve(__dirname, '../public');
const uploadsDir = path.join(publicDir, 'uploads');

if (!process.env.DATABASE_URL || !process.env.SESSION_SECRET) {
    throw new Error('Configure DATABASE_URL e SESSION_SECRET no arquivo .env.');
}

if (process.env.SESSION_SECRET.length < 32) {
    throw new Error('SESSION_SECRET deve ter pelo menos 32 caracteres.');
}

fs.mkdirSync(uploadsDir, { recursive: true });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true'
        ? { rejectUnauthorized: false }
        : undefined,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: 10
});

app.disable('x-powered-by');

app.use(helmet({
    contentSecurityPolicy: false
}));

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({
    extended: false,
    limit: '100kb'
}));

app.use('/api', rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        erro: 'Muitas requisições. Tente novamente em alguns minutos.'
    }
}));

app.use(session({
    name: 'saepvision.sid',
    secret: process.env.SESSION_SECRET,
    store: new PgSession({
        pool,
        tableName: 'user_sessions',
        createTableIfMissing: true
    }),
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 8
    }
}));

const storage = multer.diskStorage({
    destination: (_req, _file, callback) => {
        callback(null, uploadsDir);
    },
    filename: (_req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        callback(null, `${crypto.randomUUID()}${extension}`);
    }
});

const allowedExtensions = new Set([
    '.jpg', '.jpeg', '.png', '.gif', '.webp'
]);

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    },
    fileFilter: (_req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const allowedMimeTypes = new Set([
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp'
        ]);

        if (
            !allowedExtensions.has(extension) ||
            !allowedMimeTypes.has(file.mimetype)
        ) {
            return callback(
                new Error('Formato inválido. Use JPG, JPEG, PNG, GIF ou WEBP.')
            );
        }

        callback(null, true);
    }
});

function usuarioPublico(usuario) {
    return {
        id: usuario.id,
        nome: usuario.nome,
        username: usuario.username,
        email: usuario.email,
        tipo: usuario.tipo,
        foto_perfil: usuario.foto_perfil || 'default.jpg'
    };
}

function exigirLogin(req, res, next) {
    if (!req.session.usuario) {
        return res.status(401).json({
            erro: 'Faça login para continuar.'
        });
    }

    next();
}

function exigirFotografo(req, res, next) {
    if (!req.session.usuario) {
        return res.status(401).json({
            erro: 'Faça login para continuar.'
        });
    }

    if (req.session.usuario.tipo !== 'fotografo') {
        return res.status(403).json({
            erro: 'Apenas fotógrafos podem realizar esta ação.'
        });
    }

    next();
}

function normalizarUsername(username) {
    return String(username || '').trim().replace(/^@+/, '');
}

function apagarArquivoUpload(caminho) {
    if (!caminho || !caminho.startsWith('/uploads/')) {
        return;
    }

    const nomeArquivo = path.basename(caminho);
    const arquivo = path.join(uploadsDir, nomeArquivo);

    fs.unlink(arquivo, () => {});
}

async function buscarPublicacoes({ fotografoId = null, usuarioId = null } = {}) {
    const parametros = [];
    const filtros = [];

    if (fotografoId !== null) {
        parametros.push(fotografoId);
        filtros.push(`p.fotografo_id = $${parametros.length}`);
    }

    const idUsuario = usuarioId === null ? 0 : Number(usuarioId);

    const consulta = `
        SELECT
            p.id,
            p.titulo,
            p.fonte_origem,
            p.imagem,
            p.fotografo_id,
            p.data_criacao,
            u.username AS fotografo_username,
            u.foto_perfil AS fotografo_foto,
            COUNT(c.id)::int AS total_curtidas,
            COALESCE(
                BOOL_OR(c.usuario_id = $${parametros.length + 1}),
                FALSE
            ) AS curtida_pelo_usuario
        FROM publicacoes p
        JOIN usuarios u ON u.id = p.fotografo_id
        LEFT JOIN curtidas c ON c.publicacao_id = p.id
        ${filtros.length ? `WHERE ${filtros.join(' AND ')}` : ''}
        GROUP BY p.id, u.id
        ORDER BY p.data_criacao DESC, p.id DESC
    `;

    parametros.push(idUsuario);

    const resultado = await pool.query(consulta, parametros);
    return resultado.rows;
}

app.get('/api/status', async (_req, res) => {
    try {
        await pool.query('SELECT 1');

        res.json({
            status: 'online',
            banco: 'conectado',
            aplicacao: 'SAEPVision'
        });
    } catch (error) {
        console.error('Falha ao verificar o banco:', error.message);

        res.status(503).json({
            status: 'indisponivel',
            banco: 'desconectado',
            erro: 'Não foi possível conectar ao banco de dados.'
        });
    }
});

app.get('/api/auth/me', (req, res) => {
    res.json({
        usuario: req.session.usuario || null
    });
});

app.post('/api/auth/login', async (req, res, next) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        const senha = typeof req.body.senha === 'string'
            ? req.body.senha
            : '';

        if (
            !email ||
            email.length > 254 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            return res.status(400).json({
                erro: 'E-mail inválido ou vazio.'
            });
        }

        if (!senha || senha.length > 1024) {
            return res.status(400).json({
                erro: 'A senha é obrigatória.'
            });
        }

        const resultado = await pool.query(
            `SELECT id, nome, username, email, senha, tipo, foto_perfil
             FROM usuarios
             WHERE LOWER(email) = $1
             LIMIT 1`,
            [email]
        );

        const usuario = resultado.rows[0];

        if (!usuario) {
            return res.status(401).json({
                erro: 'Usuário não encontrado ou senha incorreta.'
            });
        }

        let senhaValida = false;

        try {
            senhaValida = await bcrypt.compare(senha, usuario.senha);
        } catch {
            senhaValida = false;
        }

        // Migra senhas antigas em texto puro após um login válido.
        if (!senhaValida && usuario.senha === senha) {
            const hash = await bcrypt.hash(senha, 12);

            await pool.query(
                'UPDATE usuarios SET senha = $1 WHERE id = $2',
                [hash, usuario.id]
            );

            senhaValida = true;
        }

        if (!senhaValida) {
            return res.status(401).json({
                erro: 'Usuário não encontrado ou senha incorreta.'
            });
        }

        await new Promise((resolve, reject) => {
            req.session.regenerate(error => {
                if (error) return reject(error);
                resolve();
            });
        });

        req.session.usuario = usuarioPublico(usuario);

        await new Promise((resolve, reject) => {
            req.session.save(error => {
                if (error) return reject(error);
                resolve();
            });
        });

        res.json({
            mensagem: 'Login realizado com sucesso.',
            usuario: req.session.usuario
        });
    } catch (error) {
        next(error);
    }
});

app.post('/api/auth/logout', (req, res, next) => {
    req.session.destroy(error => {
        if (error) return next(error);

        res.clearCookie('saepvision.sid', {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        });

        res.json({ mensagem: 'Logout realizado com sucesso.' });
    });
});

app.get('/api/publicacoes', async (req, res, next) => {
    try {
        const publicacoes = await buscarPublicacoes({
            usuarioId: req.session.usuario?.id ?? null
        });

        res.json({ publicacoes });
    } catch (error) {
        next(error);
    }
});

app.get('/api/fotografos', async (req, res, next) => {
    try {
        const username = normalizarUsername(req.query.username);

        if (!username || username.length > 50) {
            return res.status(400).json({
                erro: 'Informe um nome de fotógrafo válido.'
            });
        }

        const resultado = await pool.query(
            `SELECT id, nome, username, foto_perfil
             FROM usuarios
             WHERE tipo = 'fotografo'
               AND REPLACE(username, '@', '') ILIKE $1
             LIMIT 1`,
            [username]
        );

        const fotografo = resultado.rows[0];

        if (!fotografo) {
            return res.status(404).json({
                erro: 'Fotógrafo não encontrado.'
            });
        }

        const publicacoes = await buscarPublicacoes({
            fotografoId: fotografo.id,
            usuarioId: req.session.usuario?.id ?? null
        });

        res.json({
            fotografo,
            publicacoes
        });
    } catch (error) {
        next(error);
    }
});

app.post('/api/publicacoes/:id/curtida', exigirLogin, async (req, res, next) => {
    try {
        const idPublicacao = Number(req.params.id);

        if (!Number.isSafeInteger(idPublicacao) || idPublicacao < 1) {
            return res.status(400).json({
                erro: 'Publicação inválida.'
            });
        }

        const existe = await pool.query(
            'SELECT id FROM publicacoes WHERE id = $1',
            [idPublicacao]
        );

        if (existe.rowCount === 0) {
            return res.status(404).json({
                erro: 'Publicação não encontrada.'
            });
        }

        const removida = await pool.query(
            `DELETE FROM curtidas
             WHERE usuario_id = $1 AND publicacao_id = $2
             RETURNING id`,
            [req.session.usuario.id, idPublicacao]
        );

        let curtida = false;

        if (removida.rowCount === 0) {
            await pool.query(
                `INSERT INTO curtidas (usuario_id, publicacao_id)
                 VALUES ($1, $2)
                 ON CONFLICT (usuario_id, publicacao_id) DO NOTHING`,
                [req.session.usuario.id, idPublicacao]
            );

            const confirmacao = await pool.query(
                `SELECT id FROM curtidas
                 WHERE usuario_id = $1 AND publicacao_id = $2`,
                [req.session.usuario.id, idPublicacao]
            );

            curtida = confirmacao.rowCount > 0;
        }

        const contagem = await pool.query(
            'SELECT COUNT(*)::int AS total FROM curtidas WHERE publicacao_id = $1',
            [idPublicacao]
        );

        res.json({
            curtida,
            total_curtidas: contagem.rows[0].total
        });
    } catch (error) {
        next(error);
    }
});

app.get('/api/perfil', exigirFotografo, async (req, res, next) => {
    try {
        const usuarioId = req.session.usuario.id;

        const [publicacoes, metricas] = await Promise.all([
            buscarPublicacoes({ fotografoId: usuarioId, usuarioId }),
            pool.query(
                `SELECT
                    COUNT(DISTINCT p.id)::int AS total_publicacoes,
                    COUNT(c.id)::int AS total_curtidas
                 FROM publicacoes p
                 LEFT JOIN curtidas c ON c.publicacao_id = p.id
                 WHERE p.fotografo_id = $1`,
                [usuarioId]
            )
        ]);

        res.json({
            usuario: req.session.usuario,
            publicacoes,
            metricas: metricas.rows[0]
        });
    } catch (error) {
        next(error);
    }
});

app.post(
    '/api/publicacoes',
    exigirFotografo,
    (req, res, next) => {
        upload.single('imagem')(req, res, error => {
            if (error) {
                return res.status(400).json({
                    erro: error.message || 'Não foi possível enviar a imagem.'
                });
            }

            next();
        });
    },
    async (req, res, next) => {
        try {
            const titulo = String(req.body.titulo || '').trim();
            const fonte = String(req.body.fonte_origem || '').trim();

            if (!titulo || !fonte || !req.file) {
                if (req.file) {
                    fs.unlink(req.file.path, () => {});
                }

                return res.status(400).json({
                    erro: 'Informe o título, a fonte de origem e a imagem.'
                });
            }

            if (titulo.length > 150 || fonte.length > 150) {
                fs.unlink(req.file.path, () => {});

                return res.status(400).json({
                    erro: 'O título e a fonte devem ter no máximo 150 caracteres.'
                });
            }

            const imagem = `/uploads/${req.file.filename}`;

            const resultado = await pool.query(
                `INSERT INTO publicacoes
                    (titulo, fonte_origem, imagem, fotografo_id)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id, titulo, fonte_origem, imagem,
                           fotografo_id, data_criacao`,
                [titulo, fonte, imagem, req.session.usuario.id]
            );

            res.status(201).json({
                mensagem: 'Publicação cadastrada com sucesso.',
                publicacao: {
                    ...resultado.rows[0],
                    fotografo_username: req.session.usuario.username,
                    total_curtidas: 0,
                    curtida_pelo_usuario: false
                }
            });
        } catch (error) {
            if (req.file) {
                fs.unlink(req.file.path, () => {});
            }

            next(error);
        }
    }
);

app.delete('/api/publicacoes/:id', exigirFotografo, async (req, res, next) => {
    try {
        const idPublicacao = Number(req.params.id);

        if (!Number.isSafeInteger(idPublicacao) || idPublicacao < 1) {
            return res.status(400).json({
                erro: 'Publicação inválida.'
            });
        }

        const resultado = await pool.query(
            `DELETE FROM publicacoes
             WHERE id = $1 AND fotografo_id = $2
             RETURNING imagem`,
            [idPublicacao, req.session.usuario.id]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({
                erro: 'Publicação não encontrada ou você não tem permissão para excluí-la.'
            });
        }

        apagarArquivoUpload(resultado.rows[0].imagem);

        res.json({
            mensagem: 'Publicação excluída com sucesso.'
        });
    } catch (error) {
        next(error);
    }
});

app.use(express.static(publicDir));

app.use('/img', express.static(path.join(__dirname, '../img')));

app.get('/', (_req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});

app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            erro: 'Rota da API não encontrada.'
        });
    }

    res.status(404).send('Página não encontrada.');
});

app.use((error, _req, res, _next) => {
    console.error('Erro interno:', error.message);

    if (res.headersSent) {
        return;
    }

    res.status(500).json({
        erro: 'Ocorreu um erro interno no servidor.'
    });
});

async function iniciarServidor() {
    try {
        await pool.query('SELECT 1');

        app.listen(PORT, () => {
            console.log(`SAEPVision disponível em http://localhost:${PORT}`);
            console.log('PostgreSQL conectado.');
        });
    } catch (error) {
        console.error('Não foi possível conectar ao PostgreSQL.');
        console.error(error.message);
        process.exit(1);
    }
}

iniciarServidor();
