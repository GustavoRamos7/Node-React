import { Router } from 'express';
import db from '../config/db.mjs';

const router = Router();

router.post('/perfil', async (req, res) => {
  const { alunoId, preferencias, interesses, metas, nivel, perfilIA } = req.body;
  console.log('📥 Dados recebidos do frontend:', {
    alunoId,
    preferencias,
    interesses,
    metas,
    nivel,
    perfilIA
  });
  
  

  try {
    await db.query(`
      INSERT INTO perfil_aprendizagem (
        perfil_id,
        aluno_id,
        estilo_aprendizagem,
        interesses,
        metas,
        nivel_carreira,
        perfil_ia
      ) VALUES (
        UUID(),
        ?, ?, ?, ?, ?, ?
      )
      ON DUPLICATE KEY UPDATE
        estilo_aprendizagem = VALUES(estilo_aprendizagem),
        interesses = VALUES(interesses),
        metas = VALUES(metas),
        nivel_carreira = VALUES(nivel_carreira),
        perfil_ia = VALUES(perfil_ia),
        ultima_atualizacao = CURRENT_TIMESTAMP
    `, [
      alunoId,
      preferencias.join(', '),
      interesses.join(', '),
      metas,
      nivel,
      perfilIA
    ]);

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Erro ao salvar perfil vocacional:', err);
    res.status(500).json({ error: 'Erro ao salvar perfil vocacional' });
  }
});

export default router;
