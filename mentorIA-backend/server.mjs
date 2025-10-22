import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import alunoRoutes from './routes/aluno.mjs';
import genaiRoutes from './routes/genai.mjs';
import perfilRoutes from './routes/perfil.mjs';



dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Rotas organizadas
app.use('/cadastro', alunoRoutes);
app.use('/api', genaiRoutes); // ✅ Rota GenAI centralizada
app.use('/api/perfil', perfilRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
