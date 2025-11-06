import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import alunoRoutes from './routes/aluno.mjs';
import genaiRoutes from './routes/genai.mjs';
import perfilRoutes from './routes/perfil.mjs';
import trilhaRoutes from './routes/trilhaRoutes.mjs';
import gestorRoutes from './routes/gestor.mjs';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Rotas organizadas
app.use('/api/aluno', alunoRoutes);
app.use('/api', genaiRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api', trilhaRoutes);
app.use('/api/gestor', gestorRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
