import { Router } from 'express';
import { PgAnalyticsRepository } from '../../infra/database/PgAnalyticsRepository';
import { AnalyticsController } from '../../infra/http/AnalyticsController';

// --- NOVO: Importar as dependências de Cache ---
import { redisClient } from '../../infra/cache/redis';
import { RedisAnalyticsRepository } from '../../infra/cache/RedisAnalyticsRepository';
// --- FIM DA NOVIDADE ---

// Importar todos os casos de uso
import { GetTopProductsUseCase } from '../../application/use-cases/analytics/GetTopProductsUseCase';
import { GetRevenueOverTimeUseCase } from '../../application/use-cases/analytics/GetRevenueOverTimeUseCase';
import { GetSalesByChannelUseCase } from '../../application/use-cases/analytics/GetSalesByChannelUseCase';
import { GetOverallAverageTicketUseCase } from '../../application/use-cases/analytics/GetOverallAverageTicketUseCase';
import { GetSalesHeatmapUseCase } from '../../application/use-cases/analytics/GetSalesHeatmapUseCase';
import { GetSalesByPaymentTypeUseCase } from '../../application/use-cases/analytics/GetSalesByPaymentTypeUseCase';
import { GetCustomerRFMUseCase } from '../../application/use-cases/analytics/GetCustomerRFMUseCase';

/**
 * Ponto de Composição (Composition Root) para o Contexto de Analytics.
 * Este ficheiro atua como a "Fábrica" (Factory) que constrói e injeta
 * todas as dependências necessárias.
 */
const analyticsRouter = Router();

// --- 1. Construir Dependências de Infraestrutura (Singletons) ---

// --- CORREÇÃO: Aplicar o Padrão Decorator ---
// 1. Criar o repositório real (PostgreSQL)
const pgRepository = new PgAnalyticsRepository();
// 2. Criar o repositório de cache, "envolvendo" o repositório real
const analyticsRepository = new RedisAnalyticsRepository(pgRepository, redisClient);
// --- FIM DA CORREÇÃO ---


// --- 2. Construir Casos de Uso ---
// Os Casos de Uso agora recebem o 'RedisAnalyticsRepository'
// sem saberem. Eles apenas conhecem a interface IAnalyticsRepository.
const getTopProductsUseCase = new GetTopProductsUseCase(analyticsRepository);
const getRevenueOverTimeUseCase = new GetRevenueOverTimeUseCase(analyticsRepository);
const getSalesByChannelUseCase = new GetSalesByChannelUseCase(analyticsRepository);
const getOverallAverageTicketUseCase = new GetOverallAverageTicketUseCase(analyticsRepository);
const getSalesHeatmapUseCase = new GetSalesHeatmapUseCase(analyticsRepository);
const getSalesByPaymentTypeUseCase = new GetSalesByPaymentTypeUseCase(analyticsRepository);
const getCustomerRFMUseCase = new GetCustomerRFMUseCase(analyticsRepository);

// --- 3. Construir o Controller ---
// Injetar todos os casos de uso no controller
const analyticsController = new AnalyticsController(
  getTopProductsUseCase,
  getRevenueOverTimeUseCase,
  getSalesByChannelUseCase,
  getOverallAverageTicketUseCase,
  getSalesHeatmapUseCase,
  getSalesByPaymentTypeUseCase,
  getCustomerRFMUseCase
);

// --- 4. Definir as Rotas HTTP ---
analyticsRouter.get(
  '/top-products',
  (req, res) => analyticsController.getTopProducts(req, res)
);
analyticsRouter.get(
  '/revenue-over-time',
  (req, res) => analyticsController.getRevenueOverTime(req, res)
);
analyticsRouter.get(
  '/sales-by-channel',
  (req, res) => analyticsController.getSalesByChannel(req, res)
);
analyticsRouter.get(
  '/overall-average-ticket',
  (req, res) => analyticsController.getOverallAverageTicket(req, res)
);
analyticsRouter.get(
  '/sales-heatmap',
  (req, res) => analyticsController.getSalesHeatmap(req, res)
);
analyticsRouter.get(
  '/sales-by-payment-type',
  (req, res) => analyticsController.getSalesByPaymentType(req, res)
);
analyticsRouter.get(
  '/customer-rfm',
  (req, res) => analyticsController.getCustomerRFM(req, res)
);

export { analyticsRouter };

