import { Router } from 'express';
import db from '../config/db.mjs';

const router = Router();

// Rota para salvar ou substituir perfil
router.post('/', async (req, res) => {
  const { alunoId, preferencias, interesses, metas, nivel, perfilIA } = req.body;

  console.log('📥 Dados recebidos do frontend:', {
    alunoId,
    preferencias,
    interesses,
    metas,
    nivel,
    perfilIA
  });

  if (!alunoId) {
    console.error('🚫 alunoId está ausente ou nulo');
    return res.status(400).json({ error: 'alunoId é obrigatório' });
  }

  try {
    await db.query(`
      REPLACE INTO perfil_aprendizagem (
        perfil_id,
        aluno_id,
        estilo_aprendizagem,
        interesses,
        metas,
        nivel_carreira,
        perfil_ia,
        ultima_atualizacao
      ) VALUES (
        UUID(),
        ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP
      )
    `, [
      alunoId,
      preferencias.join(', '),
      interesses.join(', '),
      metas,
      nivel,
      perfilIA
    ]);

    console.log('✅ Perfil vocacional salvo com sucesso para alunoId:', alunoId);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Erro ao salvar perfil vocacional:', err.message);
    console.error('📛 Stack completa:', err.stack);
    res.status(500).json({ error: 'Erro ao salvar perfil vocacional' });
  }
});

// Rota para verificar se perfil já existe
router.get('/verificar/:alunoId', async (req, res) => {
  const { alunoId } = req.params;

  try {
    const [perfil] = await db.query(`
      SELECT perfil_ia FROM perfil_aprendizagem
      WHERE aluno_id = ?
    `, [alunoId]);

    if (perfil.length && perfil[0].perfil_ia) {
      res.json({ existe: true, perfilIA: perfil[0].perfil_ia });
    } else {
      res.json({ existe: false });
    }
  } catch (err) {
    console.error('Erro ao verificar perfil:', err);
    res.status(500).json({ error: 'Erro interno ao verificar perfil.' });
  }
});

export default router;
