import router from "./aluno.mjs";

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

function calcularScore(perfil, trilha) {
  let score = 0;

  if (trilha.estilo_aprendizagem.includes(perfil.estilo_aprendizagem)) score += 30;
  if (trilha.interesses.includes(perfil.interesses)) score += 40;
  if (trilha.nivel_carreira === perfil.nivel_carreira) score += 30;

  return score;
}

  
export default router;