import { Router } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.mjs'; // certifique-se que db.mjs também usa export default

const router = Router();

router.post('/aluno', async (req, res) => {
  try {
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

    res.status(201).json({ message: 'Aluno cadastrado com sucesso!', aluno_id });
  } catch (err) {
    console.error('❌ Erro no cadastro:', err);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

export default router;
