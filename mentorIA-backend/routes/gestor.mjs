import express from 'express';
const router = express.Router();
import db from '../config/db.mjs';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

// 🔐 Cadastro de gestor (com validação de e-mail autorizado)
router.post('/gestor/cadastro', async (req, res) => {
  const { nome, email, senha } = req.body;

  // 🔒 Lista de e-mails autorizados (whitelist)
  const emailsPermitidos = ['ramos@mentoria.com', 'gustavo@escola.com'];

  // 🔒 Domínios permitidos
  const dominiosPermitidos = ['@escola.com', '@mentoria.org'];

  // 🔍 Verifica se o e-mail é autorizado
  const emailAutorizado =
    emailsPermitidos.includes(email) ||
    dominiosPermitidos.some((dominio) => email.endsWith(dominio));

  if (!emailAutorizado) {
    return res.status(403).json({
      error: 'Este e-mail não está autorizado para cadastro de gestor.',
    });
  }

  try {
    const hash = await bcrypt.hash(senha, 10);

    await db.query(
      `INSERT INTO usuario (usuario_id, nome, email, senha_hash, papel, ativo)
       VALUES (?, ?, ?, ?, 'mentor', TRUE)`,
      [uuidv4(), nome, email, hash]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao cadastrar gestor:', err);
    res.status(500).json({ error: 'Erro interno ao cadastrar gestor.' });
  }
});

// 🔐 Login de gestor (usando tabela usuario)
router.post('/gestor/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const [usuarios] = await db.query(
      `SELECT usuario_id, nome, senha_hash
       FROM usuario
       WHERE email = ? AND papel = 'mentor'`,
      [email]
    );

    if (!usuarios.length) {
      return res.status(401).json({ error: 'Email não encontrado.' });
    }

    const usuario = usuarios[0];
    const valido = await bcrypt.compare(senha, usuario.senha_hash);

    if (!valido) {
      return res.status(401).json({ error: 'Senha incorreta.' });
    }

    res.json({ success: true, gestorId: usuario.usuario_id, nome: usuario.nome });
  } catch (err) {
    console.error('Erro ao logar gestor:', err);
    res.status(500).json({ error: 'Erro interno ao logar gestor.' });
  }
});

export default router;
