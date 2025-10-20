const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const db = require('../db'); // conexão MySQL

// Cadastro de aluno
router.post('/cadastro/aluno', async (req, res) => {
  const { nome, email, senha, data_nascimento, celular, consentimento } = req.body;

  if (!nome || !email || !senha || !consentimento) {
    return res.status(400).json({ error: 'Campos obrigatórios não preenchidos.' });
  }

  const [existe] = await db.query('SELECT * FROM aluno WHERE email = ?', [email]);
  if (existe.length > 0) {
    return res.status(409).json({ error: 'Aluno já cadastrado.' });
  }

  const senha_hash = await bcrypt.hash(senha, 10);
  const aluno_id = uuidv4();

  await db.query(`
    INSERT INTO aluno (
      aluno_id, nome, email, senha_hash, data_nascimento, celular, status,
      consentimento_termos, consentimento_data, data_cadastro
    ) VALUES (?, ?, ?, ?, ?, ?, 'ativo', ?, NOW(), NOW())
  `, [aluno_id, nome, email, senha_hash, data_nascimento, celular, consentimento]);

    res.status(201).json({
    message: 'Aluno cadastrado com sucesso!',
    aluno_id: aluno_id
});


});

// Cadastro de mentor/admin
router.post('/cadastro/usuario', async (req, res) => {
  const { nome, email, senha, papel } = req.body;

  if (!nome || !email || !senha || !papel) {
    return res.status(400).json({ error: 'Campos obrigatórios não preenchidos.' });
  }

  const [existe] = await db.query('SELECT * FROM usuario WHERE email = ?', [email]);
  if (existe.length > 0) {
    return res.status(409).json({ error: 'Usuário já existe.' });
  }

  const senha_hash = await bcrypt.hash(senha, 10);
  const usuario_id = uuidv4();

  await db.query(`
    INSERT INTO usuario (
      usuario_id, nome, email, senha_hash, papel, ativo
    ) VALUES (?, ?, ?, ?, ?, true)
  `, [usuario_id, nome, email, senha_hash, papel]);

  res.status(201).json({ message: 'Usuário cadastrado com sucesso!', usuario_id });
});

module.exports = router;
