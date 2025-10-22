import { Router } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import {
  buscarAlunoPorEmail,
  criarAluno
} from '../models/alunoModel.mjs';

const router = Router();

// ✅ Cadastro de aluno
router.post('/aluno', async (req, res) => {
  try {
    const { nome, email, senha, data_nascimento, celular, consentimento } = req.body;

    if (!nome || !email || !senha || !consentimento) {
      return res.status(400).json({ error: 'Campos obrigatórios não preenchidos.' });
    }

    const alunoExistente = await buscarAlunoPorEmail(email);
    if (alunoExistente) {
      return res.status(409).json({ error: 'Aluno já cadastrado.' });
    }

    const senha_hash = await bcrypt.hash(senha, 10);
    const aluno_id = uuidv4();

    // Converte DD/MM/YYYY para Date
    let dataConvertida = null;
    if (data_nascimento) {
      const [dia, mes, ano] = data_nascimento.split('/');
      dataConvertida = new Date(`${ano}-${mes}-${dia}`);
      if (isNaN(dataConvertida.getTime())) {
        return res.status(400).json({ error: 'Data de nascimento inválida.' });
      }
    }

    await criarAluno({
      aluno_id,
      nome,
      email,
      senha_hash,
      data_nascimento: dataConvertida,
      celular,
      consentimento
    });

    res.status(201).json({ message: 'Aluno cadastrado com sucesso!', aluno_id });
  } catch (err) {
    console.error('❌ Erro no cadastro:', err);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// ✅ Login de aluno
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ success: false, error: 'Email e senha são obrigatórios.' });
    }

    const aluno = await buscarAlunoPorEmail(email);
    if (!aluno) {
      return res.status(401).json({ success: false, error: 'Usuário não encontrado.' });
    }

    const senhaValida = await bcrypt.compare(senha, aluno.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ success: false, error: 'Senha incorreta.' });
    }

    res.json({
      success: true,
      aluno_id: aluno.aluno_id,
      nome: aluno.nome,
      email: aluno.email
    });
  } catch (err) {
    console.error('❌ Erro no login:', err);
    res.status(500).json({ success: false, error: 'Erro interno no servidor.' });
  }
});

export default router;
