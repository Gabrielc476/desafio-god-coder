import express from 'express';
import 'dotenv/config'; // Garante que o .env seja carregado
import cors from 'cors'; // 1. Importar o CORS
import { analyticsRouter } from './routes/analytics.routes';
import { aiRouter } from './routes/ai.routes';

const app = express();
const port = process.env.PORT || 3333;

// 2. Configurar o CORS para permitir requisições do seu frontend
// (Lembre-se: npm install cors)
app.use(
  cors({
    origin: 'http://localhost:3000', // URL do seu frontend Next.js
  })
);

app.use(express.json()); // Middleware para parsear JSON

// --- Rotas da API ---
// (Estas URLs agora correspondem ao frontend)
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/ai', aiRouter);

// Rota de verificação de saúde
app.get('/', (req, res) => {
  res.json({ hello: 'Nola Analytics Backend v1.0' });
});

const start = () => {
  try {
    app.listen(port, () => {
      console.log(`🚀 Servidor backend rodando em http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
};

start();
