import express from 'express';
const router = express.Router();
import db from '../config/db.mjs';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

// Cadastro de gestor (com validação de e-mail autorizado)
router.post('/cadastro', async (req, res) => {
  const { nome, email, senha } = req.body;

  const emailsPermitidos = ['ramos@mentoria.com', 'gustavo@escola.com'];
  const dominiosPermitidos = ['@escola.com', '@mentoria.org'];

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

// Login de gestor
router.post('/login', async (req, res) => {
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

// Listar todos os alunos com status e data formatada
router.get('/alunos', async (req, res) => {
  try {
    const [alunos] = await db.query(
      `SELECT aluno_id, nome, email,
              DATE_FORMAT(data_cadastro, '%Y-%m-%dT%H:%i:%sZ') AS data_cadastro,
              status
       FROM aluno
       ORDER BY nome`
    );

    res.json(alunos);
  } catch (err) {
    console.error('Erro ao buscar alunos:', err);
    res.status(500).json({ error: 'Erro ao buscar alunos.' });
  }
});

// Listar todas as trilhas
router.get('/trilhas', async (req, res) => {
  try {
    const [trilhas] = await db.query(
      `SELECT trilha_id, titulo FROM trilha_estudo ORDER BY titulo`
    );
    res.json(trilhas);
  } catch (err) {
    console.error('Erro ao buscar trilhas:', err);
    res.status(500).json({ error: 'Erro ao buscar trilhas.' });
  }
});

// Atribuir trilha a aluno
router.post('/atribuir-trilha', async (req, res) => {
  const { aluno_id, trilha_id } = req.body;

  if (!aluno_id || !trilha_id) {
    return res.status(400).json({ error: 'Aluno e trilha são obrigatórios.' });
  }

  try {
    await db.query(
      `INSERT INTO trilha_aluno (trilha_aluno_id, aluno_id, trilha_id, dt_atribuicao)
       VALUES (?, ?, ?, NOW())`,
      [uuidv4(), aluno_id, trilha_id]
    );

    res.json({ success: true, message: 'Trilha atribuída com sucesso!' });
  } catch (err) {
    console.error('Erro ao atribuir trilha:', err);
    res.status(500).json({ error: 'Erro ao atribuir trilha.' });
  }
});

// Remover trilha atribuída a um aluno
router.delete('/trilhas/remover', async (req, res) => {
  const { alunoId, trilhaId } = req.body;

  try {
    await db.query(`
      DELETE FROM trilha_aluno
      WHERE aluno_id = ? AND trilha_id = ?
    `, [alunoId, trilhaId]);

    res.json({ success: true, message: 'Trilha removida com sucesso.' });
  } catch (err) {
    console.error('Erro ao remover trilha atribuída:', err);
    res.status(500).json({ error: 'Erro ao remover trilha atribuída.' });
  }
});


// Obter perfil vocacional do aluno
router.get('/aluno/:id/perfil', async (req, res) => {
  const alunoId = req.params.id;

  try {
    const [perfil] = await db.query(
      `SELECT estilo_aprendizagem, interesses, metas, nivel_carreira, perfil_ia
       FROM perfil_aprendizagem
       WHERE aluno_id = ?`,
      [alunoId]
    );

    const [trilhas] = await db.query(
      `SELECT te.titulo
       FROM trilha_aluno ta
       JOIN trilha_estudo te ON ta.trilha_id = te.trilha_id
       WHERE ta.aluno_id = ?`,
      [alunoId]
    );

    if (!perfil.length) {
      return res.status(404).json({ error: 'Perfil de aprendizagem não encontrado.' });
    }

    const dados = perfil[0];

    const interesses = dados.interesses
      ? dados.interesses.split(',').map(i => i.trim()).filter(Boolean)
      : [];

    res.json({
      preferencias: [dados.estilo_aprendizagem].filter(Boolean),
      interesses,
      metas: dados.metas || '',
      nivel: dados.nivel_carreira || '',
      trilhasSugeridas: trilhas.map(t => t.titulo),
      perfilIA: dados.perfil_ia || ''
    });
  } catch (err) {
    console.error('Erro ao buscar perfil de aprendizagem:', err);
    res.status(500).json({ error: 'Erro ao buscar perfil de aprendizagem.' });
  }
});



export default router;
