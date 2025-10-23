import express from 'express';
const router = express.Router();
import db from '../config/db.mjs';

// 🔹 Buscar trilhas sugeridas
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

// 🔹 Atribuir trilha ao aluno
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
      VALUES (UUID(), ?, ?, ?)
    `, [alunoId, trilhaId, score]);

    res.json({ success: true, score });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Trilha já atribuída a este aluno.' });
    }

    console.error('Erro ao atribuir trilha:', err);
    res.status(500).json({ error: 'Erro interno ao atribuir trilha.' });
  }
});

// 🔹 Cadastrar nova trilha
router.post('/trilhas/cadastrar', async (req, res) => {
  const { titulo, descricao, estilo_aprendizagem, interesses, nivel_carreira } = req.body;

  try {
    await db.query(`
      INSERT INTO trilha_estudo (trilha_id, titulo, descricao, estilo_aprendizagem, interesses, nivel_carreira)
      VALUES (UUID(), ?, ?, ?, ?, ?)
    `, [titulo, descricao, estilo_aprendizagem, interesses, nivel_carreira]);

    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao cadastrar trilha:', err);
    res.status(500).json({ error: 'Erro interno ao cadastrar trilha.' });
  }
});

// 🔹 Listar todas as trilhas
router.get('/trilhas', async (req, res) => {
  try {
    const [trilhas] = await db.query(`SELECT * FROM trilha_estudo`);
    res.json({ trilhas });
  } catch (err) {
    console.error('Erro ao buscar trilhas:', err);
    res.status(500).json({ error: 'Erro interno ao buscar trilhas.' });
  }
});

// 🔹 Editar trilha
router.put('/trilhas/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, descricao, estilo_aprendizagem, interesses, nivel_carreira } = req.body;

  try {
    const [resultado] = await db.query(`
      UPDATE trilha_estudo
      SET titulo = ?, descricao = ?, estilo_aprendizagem = ?, interesses = ?, nivel_carreira = ?
      WHERE trilha_id = ?
    `, [titulo, descricao, estilo_aprendizagem, interesses, nivel_carreira, id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Trilha não encontrada.' });
    }

    res.json({ success: true, message: 'Trilha atualizada com sucesso.' });
  } catch (err) {
    console.error('Erro ao editar trilha:', err);
    res.status(500).json({ error: 'Erro interno ao atualizar trilha.' });
  }
});

// 🔹 Excluir trilha
router.delete('/trilhas/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [resultado] = await db.query(`DELETE FROM trilha_estudo WHERE trilha_id = ?`, [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Trilha não encontrada.' });
    }

    res.json({ success: true, message: 'Trilha excluída com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir trilha:', err);
    res.status(500).json({ error: 'Erro interno ao excluir trilha.' });
  }
});

// 🔹 Função auxiliar para calcular score
function calcularScore(perfil, trilha) {
  let score = 0;

  if (trilha.estilo_aprendizagem.includes(perfil.estilo_aprendizagem)) score += 30;
  if (trilha.interesses.includes(perfil.interesses)) score += 40;
  if (trilha.nivel_carreira === perfil.nivel_carreira) score += 30;

  return score;
}

export default router;
