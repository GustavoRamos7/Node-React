import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import alunoRoutes from './routes/aluno.mjs';
import fetch from 'node-fetch'; // ou axios

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/cadastro', alunoRoutes);

// 🔹 Novo endpoint seguro para GenAI
app.post('/api/genai', async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await fetch('https://api.genai.com/endpoint', { // substitua pelo endpoint real
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao chamar a API GenAI' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
