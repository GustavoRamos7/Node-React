import { Router } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/db.mjs';
import gerarConteudoSugerido from './iaConteudo.mjs';
import {
  buscarAlunoPorEmail,
  criarAluno
} from '../models/alunoModel.mjs';

const router = Router();

// Cadastro de aluno
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

// Login de aluno
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

// Buscar trilhas sugeridas com base no perfil
router.post('/trilhas/sugeridas', async (req, res) => {
  const { alunoId } = req.body;

  try {
    const [perfil] = await db.query(`
      SELECT estilo_aprendizagem, interesses, nivel_carreira
      FROM perfil_aprendizagem
      WHERE aluno_id = ?
    `, [alunoId]);

    if (!perfil.length) {
      return res.status(404).json({ error: 'Perfil não encontrado.' });
    }

    const { estilo_aprendizagem, interesses, nivel_carreira } = perfil[0];

    const [trilhas] = await db.query(`
      SELECT trilha_id, titulo, descricao
      FROM trilha_estudo
      WHERE
        estilo_aprendizagem LIKE ? OR
        interesses LIKE ? OR
        nivel_carreira = ?
      LIMIT 5
    `, [`%${estilo_aprendizagem}%`, `%${interesses}%`, nivel_carreira]);

    res.json({ trilhas });
  } catch (err) {
    console.error('Erro ao buscar trilhas sugeridas:', err);
    res.status(500).json({ error: 'Erro interno ao buscar trilhas.' });
  }
});

// Remover trilha atribuída ao aluno
router.delete('/trilhas/remover', async (req, res) => {
  const { alunoId, trilhaId } = req.body;

  try {
    await db.query(`
      DELETE FROM trilha_aluno
      WHERE aluno_id = ? AND trilha_id = ?
    `, [alunoId, trilhaId]);

    res.json({ success: true, message: 'Trilha removida com sucesso.' });
  } catch (err) {
    console.error('Erro ao remover trilha:', err);
    res.status(500).json({ error: 'Erro ao remover trilha.' });
  }
});

// Gerar conteúdo sugerido com IA
router.get('/trilha/:trilhaId/conteudo-sugerido', async (req, res) => {
  const { trilhaId } = req.params;

  try {
    const [trilha] = await db.query(`
      SELECT titulo, estilo_aprendizagem, interesses, nivel_carreira
      FROM trilha_estudo
      WHERE trilha_id = ?
    `, [trilhaId]);

    if (!trilha.length) {
      return res.status(404).json({ error: 'Trilha não encontrada.' });
    }

    const conteudoGerado = await gerarConteudoSugerido(trilha[0]);
    res.json({ conteudo: conteudoGerado });
  } catch (err) {
    console.error('Erro ao gerar conteúdo sugerido:', err);
    res.status(500).json({ error: 'Erro ao gerar conteúdo sugerido.' });
  }
});



// Atribuir trilha ao aluno com score
router.post('/trilhas/atribuir', async (req, res) => {
  const { alunoId, trilhaId } = req.body;

  try {
    const [perfil] = await db.query(`
      SELECT estilo_aprendizagem, interesses, nivel_carreira
      FROM perfil_aprendizagem
      WHERE aluno_id = ?
    `, [alunoId]);

    const [trilha] = await db.query(`
      SELECT estilo_aprendizagem, interesses, nivel_carreira
      FROM trilha_estudo
      WHERE trilha_id = ?
    `, [trilhaId]);

    if (!perfil.length || !trilha.length) {
      return res.status(404).json({ error: 'Dados não encontrados.' });
    }

    const score = calcularScore(perfil[0], trilha[0]);

    await db.query(`
      INSERT INTO trilha_aluno (trilha_aluno_id, aluno_id, trilha_id, score_adequacao, dt_atribuicao)
      VALUES (?, ?, ?, ?, NOW())
    `, [uuidv4(), alunoId, trilhaId, score]);

    res.json({ success: true, score });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Trilha já atribuída a este aluno.' });
    }

    console.error('Erro ao atribuir trilha:', err);
    res.status(500).json({ error: 'Erro interno ao atribuir trilha.' });
  }
});

// Visualizar trilhas atribuídas ao aluno
router.get('/trilhas/sugeridas/:alunoId', async (req, res) => {
  const { alunoId } = req.params;

  try {
    const [trilhas] = await db.query(`
      SELECT te.trilha_id, te.titulo, te.descricao, ta.score_adequacao
      FROM trilha_aluno ta
      JOIN trilha_estudo te ON ta.trilha_id = te.trilha_id
      WHERE ta.aluno_id = ?
      ORDER BY ta.dt_atribuicao DESC
    `, [alunoId]);

    res.json({ trilhas });
  } catch (err) {
    console.error('Erro ao buscar trilhas atribuídas:', err);
    res.status(500).json({ error: 'Erro ao buscar trilhas atribuídas.' });
  }
});

router.get('/trilha/:trilhaId', async (req, res) => {
  const { trilhaId } = req.params;

  try {
    const [trilha] = await db.query(`
      SELECT titulo, descricao, estilo_aprendizagem, interesses, nivel_carreira
      FROM trilha_estudo
      WHERE trilha_id = ?
    `, [trilhaId]);

    if (!trilha.length) {
      return res.status(404).json({ error: 'Trilha não encontrada.' });
    }

    res.json({ trilha: trilha[0] });
  } catch (err) {
    console.error('Erro ao buscar detalhes da trilha:', err);
    res.status(500).json({ error: 'Erro ao buscar detalhes da trilha.' });
  }
});

// Listar todas as trilhas disponíveis no sistema (para alunos explorarem)
router.get('/trilhas/todas', async (req, res) => {
  try {
    const [trilhas] = await db.query(`
      SELECT trilha_id, titulo, descricao
      FROM trilha_estudo
      ORDER BY titulo ASC
    `);

    res.json({ trilhas });
  } catch (err) {
    console.error('Erro ao buscar trilhas gerais:', err);
    res.status(500).json({ error: 'Erro interno ao buscar trilhas.' });
  }
});



// Função auxiliar para calcular score de adequação
function calcularScore(perfil, trilha) {
  let score = 0;

  if (trilha.estilo_aprendizagem.includes(perfil.estilo_aprendizagem)) score += 30;
  if (trilha.interesses.includes(perfil.interesses)) score += 40;
  if (trilha.nivel_carreira === perfil.nivel_carreira) score += 30;

  return score;
}

export default router;
