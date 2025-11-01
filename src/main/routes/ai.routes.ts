import { Router } from 'express';

// --- Importações de Infraestrutura ---
import { PgAnalyticsRepository } from '@/infra/database/PgAnalyticsRepository';
import { GeminiAssistantService } from '@/infra/ai/GeminiAssistantService';
import { AIController } from '@/infra/http/AIController';

// --- NOVO: Importar as dependências de Cache ---
import { redisClient } from '@/infra/cache/redis';
import { RedisAnalyticsRepository } from '@/infra/cache/RedisAnalyticsRepository';
// --- FIM DA NOVIDADE ---

// --- Importações dos Casos de Uso (Camada de Aplicação) ---
import { AskGeminiAnalyticsUseCase } from '@/application/use-cases/ai/AskGeminiAnalyticsUseCase';
import { ExplainAnalyticsDataUseCase } from '@/application/use-cases/ai/ExplainAnalyticsDataUseCase';

// Importar *todos* os casos de uso analíticos
import { GetTopProductsUseCase } from '@/application/use-cases/analytics/GetTopProductsUseCase';
import { GetRevenueOverTimeUseCase } from '@/application/use-cases/analytics/GetRevenueOverTimeUseCase';
import { GetSalesByChannelUseCase } from '@/application/use-cases/analytics/GetSalesByChannelUseCase';
import { GetOverallAverageTicketUseCase } from '@/application/use-cases/analytics/GetOverallAverageTicketUseCase';
import { GetSalesHeatmapUseCase } from '@/application/use-cases/analytics/GetSalesHeatmapUseCase';
import { GetSalesByPaymentTypeUseCase } from '@/application/use-cases/analytics/GetSalesByPaymentTypeUseCase';
import { GetCustomerRFMUseCase } from '@/application/use-cases/analytics/GetCustomerRFMUseCase';

// Importar o utilitário de data
import { getLocalTodayDateString } from '@/application/utils/date.utils';


/**
 * Ponto de Composição (Composition Root) para o Contexto de IA.
 */
const aiRouter = Router();

// --- 1. Construir Dependências de Infraestrutura (Singletons) ---

// --- CORREÇÃO: Aplicar o Padrão Decorator ---
// 1. Criar o repositório real (PostgreSQL)
const pgRepository = new PgAnalyticsRepository();
// 2. Criar o repositório de cache, "envolvendo" o repositório real
const analyticsRepository = new RedisAnalyticsRepository(pgRepository, redisClient);
// --- FIM DA CORREÇÃO ---

// 3. Obter a data local
const localToday = getLocalTodayDateString();
// 4. Injetar a data no Serviço de Infraestrutura da IA
const assistantService = new GeminiAssistantService(localToday);


// --- 2. Construir Casos de Uso Analíticos ---
// (Estes são necessários como "ferramentas" para o AskGeminiUseCase)
// Agora, eles são construídos com o repositório com *cache*.
const getTopProductsUseCase = new GetTopProductsUseCase(analyticsRepository);
const getRevenueOverTimeUseCase = new GetRevenueOverTimeUseCase(analyticsRepository);
const getSalesByChannelUseCase = new GetSalesByChannelUseCase(analyticsRepository);
const getOverallAverageTicketUseCase = new GetOverallAverageTicketUseCase(analyticsRepository);
const getSalesHeatmapUseCase = new GetSalesHeatmapUseCase(analyticsRepository);
const getSalesByPaymentTypeUseCase = new GetSalesByPaymentTypeUseCase(analyticsRepository);
const getCustomerRFMUseCase = new GetCustomerRFMUseCase(analyticsRepository);

// --- 3. Construir Casos de Uso de IA ---
const askGeminiAnalyticsUseCase = new AskGeminiAnalyticsUseCase(
  assistantService,
  getTopProductsUseCase,
  getRevenueOverTimeUseCase,
  getSalesByChannelUseCase,
  getOverallAverageTicketUseCase,
  getSalesHeatmapUseCase,
  getSalesByPaymentTypeUseCase,
  getCustomerRFMUseCase
);
const explainAnalyticsDataUseCase = new ExplainAnalyticsDataUseCase(assistantService);

// --- 4. Construir o Controller ---
const aiController = new AIController(
  askGeminiAnalyticsUseCase,
  explainAnalyticsDataUseCase
);

// --- 5. Definir as Rotas HTTP ---
aiRouter.post(
  '/ask',
  (req, res) => aiController.ask(req, res)
);
aiRouter.post(
  '/explain',
  (req, res) => aiController.explain(req, res)
);

export { aiRouter };

