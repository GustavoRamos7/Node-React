router.post('/perfil', async (req, res) => {
    const { alunoId, preferencias, interesses, metas, nivel } = req.body;
  
    try {
      const perfil = {
        estilo_aprendizagem: preferencias,
        interesses: interesses.join(', '),
        metas,
        nivel_carreira: nivel,
        ultima_atualizacao: new Date()
      };
  
      // Salvar ou atualizar perfil no banco
      const existente = await PerfilAprendizagem.findOne({ aluno_id: alunoId });
      if (existente) {
        await existente.updateOne(perfil);
      } else {
        await PerfilAprendizagem.create({ aluno_id: alunoId, ...perfil });
      }
  
      res.json({ success: true, perfil });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao gerar perfil vocacional' });
    }
  });
  