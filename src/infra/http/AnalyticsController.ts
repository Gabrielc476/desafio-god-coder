import { Request, Response } from "express";
import { GetTopProductsUseCase } from "@/application/use-cases/analytics/GetTopProductsUseCase";
import { GetRevenueOverTimeUseCase } from "@/application/use-cases/analytics/GetRevenueOverTimeUseCase";
import { Granularity } from "@/domain/repositories/IAnalyticsRepository";
import { GetSalesByChannelUseCase } from "@/application/use-cases/analytics/GetSalesByChannelUseCase";
import { GetOverallAverageTicketUseCase } from "@/application/use-cases/analytics/GetOverallAverageTicketUseCase";
import { GetSalesHeatmapUseCase } from "@/application/use-cases/analytics/GetSalesHeatmapUseCase";
import { GetSalesByPaymentTypeUseCase } from "@/application/use-cases/analytics/GetSalesByPaymentTypeUseCase";
import { GetCustomerRFMUseCase } from "@/application/use-cases/analytics/GetCustomerRFMUseCase";

/**
 * Controller para lidar com requisições HTTP da API de Análises.
 * Orquestra a chamada aos Casos de Uso e formata a resposta.
 */
export class AnalyticsController {
  // Injeção de dependência de todos os casos de uso de análise
  constructor(
    private getTopProductsUseCase: GetTopProductsUseCase,
    private getRevenueOverTimeUseCase: GetRevenueOverTimeUseCase,
    private getSalesByChannelUseCase: GetSalesByChannelUseCase,
    private getOverallAverageTicketUseCase: GetOverallAverageTicketUseCase,
    private getSalesHeatmapUseCase: GetSalesHeatmapUseCase,
    private getSalesByPaymentTypeUseCase: GetSalesByPaymentTypeUseCase,
    private getCustomerRFMUseCase: GetCustomerRFMUseCase // NOVO
  ) {}

  /**
   * Lida com a requisição GET /top-products
   */
  async getTopProducts(req: Request, res: Response): Promise<Response> {
    try {
      // 1. Validar e extrair dados da requisição (Query Params)
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res
          .status(400)
          .json({ error: "startDate e endDate são obrigatórios." });
      }

      // 2. Chamar o Caso de Uso
      const topProducts = await this.getTopProductsUseCase.execute({
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
      });

      // 3. Retornar a resposta
      return res.status(200).json(topProducts);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor." });
    }
  }

  /**
   * Lida com a requisição GET /revenue-over-time
   */
  async getRevenueOverTime(req: Request, res: Response): Promise<Response> {
    try {
      // 1. Validar e extrair dados
      const { startDate, endDate, granularity } = req.query;
      if (!startDate || !endDate) {
        return res
          .status(400)
          .json({ error: "startDate e endDate são obrigatórios." });
      }

      // 2. Chamar o Caso de Uso
      const revenueOverTime = await this.getRevenueOverTimeUseCase.execute({
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
        granularity: (granularity as Granularity) || "day",
      });

      // 3. Retornar a resposta
      return res.status(200).json(revenueOverTime);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor." });
    }
  }

  /**
   * Lida com a requisição GET /sales-by-channel
   */
  async getSalesByChannel(req: Request, res: Response): Promise<Response> {
    try {
      // 1. Validar e extrair dados
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res
          .status(400)
          .json({ error: "startDate e endDate são obrigatórios." });
      }

      // 2. Chamar o Caso de Uso
      const salesByChannel = await this.getSalesByChannelUseCase.execute({
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
      });

      // 3. Retornar a resposta
      return res.status(200).json(salesByChannel);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor." });
    }
  }

  /**
   * Lida com a requisição GET /overall-average-ticket
   */
  async getOverallAverageTicket(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      // 1. Validar e extrair dados
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res
          .status(400)
          .json({ error: "startDate e endDate são obrigatórios." });
      }

      // 2. Chamar o Caso de Uso
      const avgTicket = await this.getOverallAverageTicketUseCase.execute({
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
      });

      // 3. Retornar a resposta
      return res.status(200).json(avgTicket);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor." });
    }
  }

  /**
   * Lida com a requisição GET /sales-heatmap
   */
  async getSalesHeatmap(req: Request, res: Response): Promise<Response> {
    try {
      // 1. Validar e extrair dados
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res
          .status(400)
          .json({ error: "startDate e endDate são obrigatórios." });
      }

      // 2. Chamar o Caso de Uso
      const heatmapData = await this.getSalesHeatmapUseCase.execute({
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
      });

      // 3. Retornar a resposta
      return res.status(200).json(heatmapData);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor." });
    }
  }

  /**
   * Lida com a requisição GET /sales-by-payment-type
   */
  async getSalesByPaymentType(req: Request, res: Response): Promise<Response> {
    try {
      // 1. Validar e extrair dados
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res
          .status(400)
          .json({ error: "startDate e endDate são obrigatórios." });
      }

      // 2. Chamar o Caso de Uso
      const paymentData = await this.getSalesByPaymentTypeUseCase.execute({
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
      });

      // 3. Retornar a resposta
      return res.status(200).json(paymentData);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor." });
    }
  }

  /**
   * NOVO: Lida com a requisição GET /customer-rfm
   */
  async getCustomerRFM(req: Request, res: Response): Promise<Response> {
    try {
      // 1. Validar e extrair dados
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res
          .status(400)
          .json({ error: "startDate e endDate são obrigatórios." });
      }

      // 2. Chamar o Caso de Uso
      const rfmData = await this.getCustomerRFMUseCase.execute({
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
      });

      // 3. Retornar a resposta
      return res.status(200).json(rfmData);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Erro interno do servidor." });
    }
  }
}

