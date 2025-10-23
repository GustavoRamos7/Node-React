import router from "./aluno.mjs";

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