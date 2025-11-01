import express from 'express';
import 'dotenv/config'; // Garante que o .env seja carregado
import { analyticsRouter } from './routes/analytics.routes';
import { aiRouter } from './routes/ai.routes'; // 1. Importar o novo router

const app = express();
const port = process.env.PORT || 3333;

app.use(express.json()); // Middleware para parsear JSON

// --- Rotas da API ---

// Rotas de Análise (KPIs, Gráficos)
app.use('/api/v1/analytics', analyticsRouter);

// 2. Usar o novo router de IA
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

