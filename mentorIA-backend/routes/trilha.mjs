router.post('/trilhas/sugeridas', async (req, res) => {
    const { interesses } = req.body;
  
    try {
      const trilhas = await TrilhaEstudo.find({
        temas: { $in: interesses } // ou use LIKE se for SQL
      });
  
      res.json({ trilhas });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao buscar trilhas sugeridas' });
    }
  });
  