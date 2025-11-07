import {
  TopProductDTO,
  RevenueOverTimeDTO,
  SalesByChannelDTO,
  OverallAverageTicketDTO,
  SalesHeatmapDTO,
  SalesByPaymentTypeDTO,
  CustomerRFMDTO,
} from "@/domain/dtos";
import { Granularity, IAnalyticsRepository } from "@/domain/repositories/IAnalyticsRepository";
import { db } from "./db"; // Importamos o nosso pool de conexão

/**
 * Implementação Concreta do Repositório de Análises usando PostgreSQL.
 * Esta classe cumpre o contrato definido em IAnalyticsRepository.
 */
export class PgAnalyticsRepository implements IAnalyticsRepository {
  /**
   * Busca os produtos mais vendidos.
   */
  async getTopSellingProducts(
    startDate: Date,
    endDate: Date
  ): Promise<TopProductDTO[]> {
    const query = `
      SELECT 
        prod.id AS "productId",
        prod.name,
        SUM(ps.quantity) AS "totalSold",
        SUM(ps.total_price) AS "totalRevenue"
      FROM product_sales ps
      JOIN sales sl ON ps.sale_id = sl.id
      JOIN products prod ON ps.product_id = prod.id
      WHERE sl.created_at BETWEEN $1 AND $2
      AND sl.sale_status_desc = 'COMPLETED'
      GROUP BY prod.id, prod.name
      ORDER BY "totalRevenue" DESC
      LIMIT 10;
    `;
    try {
      const { rows } = await db.query(query, [startDate, endDate]);
      // Garantir a conversão de tipos (ex: sum() do PG retorna string)
      return rows.map((row) => ({
        ...row,
        productId: parseInt(row.productId, 10),
        totalSold: parseFloat(row.totalSold),
        totalRevenue: parseFloat(row.totalRevenue),
      }));
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `Erro ao executar query getTopSellingProducts: ${error.message}`
        );
      } else {
        console.error(
          "Erro desconhecido ao executar query getTopSellingProducts",
          error
        );
      }
      throw new Error("Falha ao buscar os produtos mais vendidos.");
    }
  }

  /**
   * Busca o faturamento ao longo do tempo.
   */
  async getRevenueOverTime(
    startDate: Date,
    endDate: Date,
    granularity: Granularity
  ): Promise<RevenueOverTimeDTO[]> {
    // DATE_TRUNC agrupa os timestamps pela granularidade (day, week, month)
    const query = `
      SELECT 
        DATE_TRUNC($3, sl.created_at) AS "date",
        SUM(sl.total_amount) AS "totalRevenue"
      FROM sales sl
      WHERE sl.created_at BETWEEN $1 AND $2
      AND sl.sale_status_desc = 'COMPLETED'
      GROUP BY "date"
      ORDER BY "date" ASC;
    `;
    try {
      const { rows } = await db.query(query, [startDate, endDate, granularity]);
      return rows.map((row) => ({
        ...row,
        totalRevenue: parseFloat(row.totalRevenue),
      }));
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `Erro ao executar query getRevenueOverTime: ${error.message}`
        );
      } else {
        console.error(
          "Erro desconhecido ao executar query getRevenueOverTime",
          error
        );
      }
      throw new Error("Falha ao buscar o faturamento ao longo do tempo.");
    }
  }

  /**
   * Busca as vendas por canal.
   */
  async getSalesByChannel(
    startDate: Date,
    endDate: Date
  ): Promise<SalesByChannelDTO[]> {
    const query = `
      SELECT 
        ch.id AS "channelId",
        ch.name AS "channelName",
        COUNT(sl.id) AS "totalSales",
        SUM(sl.total_amount) AS "totalRevenue"
      FROM sales sl
      JOIN channels ch ON sl.channel_id = ch.id
      WHERE sl.created_at BETWEEN $1 AND $2
      AND sl.sale_status_desc = 'COMPLETED'
      GROUP BY ch.id, ch.name
      ORDER BY "totalRevenue" DESC;
    `;
    try {
      const { rows } = await db.query(query, [startDate, endDate]);
      return rows.map((row) => ({
        ...row,
        channelId: parseInt(row.channelId, 10),
        totalSales: parseInt(row.totalSales, 10),
        totalRevenue: parseFloat(row.totalRevenue),
      }));
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `Erro ao executar query getSalesByChannel: ${error.message}`
        );
      } else {
        console.error(
          "Erro desconhecido ao executar query getSalesByChannel",
          error
        );
      }
      throw new Error("Falha ao buscar as vendas por canal.");
    }
  }

  /**
   * Busca o ticket médio geral.
   */
  async getOverallAverageTicket(
    startDate: Date,
    endDate: Date
  ): Promise<OverallAverageTicketDTO | null> {
    const query = `
      SELECT 
        AVG(sl.total_amount) AS "averageTicket",
        COUNT(sl.id) AS "totalSales"
      FROM sales sl
      WHERE sl.sale_status_desc = 'COMPLETED'
      AND sl.created_at BETWEEN $1 AND $2;
    `;
    try {
      const { rows } = await db.query(query, [startDate, endDate]);

      // AVG retorna null se não houver linhas, o que é o comportamento correto
      if (rows.length === 0 || rows[0].averageTicket === null) {
        return null;
      }

      return {
        averageTicket: parseFloat(rows[0].averageTicket),
        totalSales: parseInt(rows[0].totalSales, 10),
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `Erro ao executar query getOverallAverageTicket: ${error.message}`
        );
      } else {
        console.error(
          "Erro desconhecido ao executar query getOverallAverageTicket",
          error
        );
      }
      throw new Error("Falha ao buscar o ticket médio geral.");
    }
  }

  /**
   * Busca o heatmap de vendas (por hora e canal).
   */
  async getSalesHeatmap(
    startDate: Date,
    endDate: Date
  ): Promise<SalesHeatmapDTO[]> {
    const query = `
      SELECT 
        EXTRACT(HOUR FROM sl.created_at) AS "hour",
        ch.id AS "channelId",
        ch.name AS "channelName",
        COUNT(sl.id) AS "totalSales",
        SUM(sl.total_amount) AS "totalRevenue"
      FROM sales sl
      JOIN channels ch ON sl.channel_id = ch.id
      WHERE sl.sale_status_desc = 'COMPLETED'
      AND sl.created_at BETWEEN $1 AND $2
      GROUP BY "hour", ch.id, ch.name
      ORDER BY "hour", "totalRevenue" DESC;
    `;
    try {
      const { rows } = await db.query(query, [startDate, endDate]);
      return rows.map((row) => ({
        ...row,
        hour: parseInt(row.hour, 10),
        channelId: parseInt(row.channelId, 10),
        totalSales: parseInt(row.totalSales, 10),
        totalRevenue: parseFloat(row.totalRevenue),
      }));
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `Erro ao executar query getSalesHeatmap: ${error.message}`
        );
      } else {
        console.error(
          "Erro desconhecido ao executar query getSalesHeatmap",
          error
        );
      }
      throw new Error("Falha ao buscar o heatmap de vendas.");
    }
  }

  /**
   * Busca as vendas por tipo de pagamento.
   */
  async getSalesByPaymentType(
    startDate: Date,
    endDate: Date
  ): Promise<SalesByPaymentTypeDTO[]> {
    const query = `
      SELECT 
        pt.id AS "paymentTypeId",
        pt.description AS "paymentTypeName",
        SUM(p.value) AS "totalRevenue",
        COUNT(p.id) AS "totalTransactions"
      FROM sales sl
      JOIN payments p ON sl.id = p.sale_id
      JOIN payment_types pt ON p.payment_type_id = pt.id
      WHERE sl.sale_status_desc = 'COMPLETED'
      AND sl.created_at BETWEEN $1 AND $2
      GROUP BY pt.id, pt.description
      ORDER BY "totalRevenue" DESC;
    `;
    try {
      const { rows } = await db.query(query, [startDate, endDate]);
      return rows.map((row) => ({
        ...row,
        paymentTypeId: parseInt(row.paymentTypeId, 10),
        totalRevenue: parseFloat(row.totalRevenue),
        totalTransactions: parseInt(row.totalTransactions, 10),
      }));
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `Erro ao executar query getSalesByPaymentType: ${error.message}`
        );
      } else {
        console.error(
          "Erro desconhecido ao executar query getSalesByPaymentType",
          error
        );
      }
      throw new Error("Falha ao buscar as vendas por tipo de pagamento.");
    }
  }

  /**
   * NOVO: Busca a análise RFM dos clientes.
   */
  async getCustomerRFM(
    startDate: Date,
    endDate: Date
  ): Promise<CustomerRFMDTO[]> {
    const query = `
      SELECT 
        c.id AS "customerId", 
        c.customer_name AS "customerName", 
        MAX(sl.created_at) AS "lastPurchaseDate", 
        COUNT(sl.id) AS "frequency", 
        SUM(sl.total_amount) AS "monetaryValue"
      FROM sales sl
      JOIN customers c ON sl.customer_id = c.id
      WHERE sl.sale_status_desc = 'COMPLETED'
      AND sl.created_at BETWEEN $1 AND $2
      AND sl.customer_id IS NOT NULL
      GROUP BY c.id, c.customer_name
      ORDER BY "monetaryValue" DESC
      LIMIT 100; -- Limitar a um número razoável para o dashboard
    `;
    try {
      const { rows } = await db.query(query, [startDate, endDate]);
      return rows.map((row) => ({
        ...row,
        customerId: parseInt(row.customerId, 10),
        frequency: parseInt(row.frequency, 10),
        monetaryValue: parseFloat(row.monetaryValue),
      }));
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Erro ao executar query getCustomerRFM: ${error.message}`);
      } else {
        console.error("Erro desconhecido ao executar query getCustomerRFM", error);
      }
      throw new Error("Falha ao buscar a análise RFM de clientes.");
    }
  }
}

