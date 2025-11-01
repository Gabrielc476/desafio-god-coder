// Define o "contrato" de dados que a aplicação espera.
// Não depende de nenhuma camada externa (ex: aplicação ou infra).

// O tipo Granularity é definido aqui, na camada de Domínio,
// pois é usado pelo contrato da interface.
export type Granularity = 'day' | 'week' | 'month';

// --- DTOs (Data Transfer Objects) ---
// Define a "forma" dos dados que fluem através dos limites das camadas.

/**
 * DTO para o caso de uso "Top Produtos".
 */
export type TopProductDTO = {
  productId: number;
  name: string;
  totalSold: number;
  totalRevenue: number;
};

/**
 * DTO para o caso de uso "Faturação Ao Longo do Tempo".
 */
export type RevenueOverTimeDTO = {
  date: Date;
  totalRevenue: number;
};

/**
 * DTO para o caso de uso "Vendas por Canal".
 */
export type SalesByChannelDTO = {
  channelId: number;
  channelName: string;
  totalSales: number;
  totalRevenue: number;
};

/**
 * DTO para o caso de uso "Ticket Médio Geral".
 */
export type OverallAverageTicketDTO = {
  averageTicket: number;
  totalSales: number;
};

/**
 * DTO para o caso de uso "Heatmap de Vendas".
 */
export type SalesHeatmapDTO = {
  hour: number;
  channelId: number;
  channelName: string;
  totalSales: number;
  totalRevenue: number;
};

/**
 * DTO para o caso de uso "Vendas por Tipo de Pagamento".
 */
export type SalesByPaymentTypeDTO = {
  paymentTypeId: number;
  paymentTypeName: string;
  totalRevenue: number;
  totalTransactions: number;
};

/**
 * DTO para o caso de uso "Análise de Clientes (RFM)".
 */
export type CustomerRFMDTO = {
  customerId: number;
  customerName: string;
  lastPurchaseDate: Date;
  frequency: number;
  monetaryValue: number;
};

// --- Interface do Repositório (O Contrato) ---

/**
 * Define o "contrato" que a camada de Aplicação
 * usa para solicitar dados analíticos.
 */
export interface IAnalyticsRepository {
  /**
   * Busca os produtos mais vendidos num período.
   */
  getTopSellingProducts(
    startDate: Date,
    endDate: Date
  ): Promise<TopProductDTO[]>;

  /**
   * Busca o faturamento agregado por granularidade (dia, semana, mês) num período.
   */
  getRevenueOverTime(
    startDate: Date,
    endDate: Date,
    granularity: Granularity // Agora usa o tipo local
  ): Promise<RevenueOverTimeDTO[]>;

  /**
   * Busca o total de vendas e faturamento agrupado por canal num período.
   */
  getSalesByChannel(
    startDate: Date,
    endDate: Date
  ): Promise<SalesByChannelDTO[]>;

  /**
   * Busca o ticket médio geral e o total de vendas num período.
   */
  getOverallAverageTicket(
    startDate: Date,
    endDate: Date
  ): Promise<OverallAverageTicketDTO | null>;

  /**
   * Busca o heatmap de vendas (agrupado por hora e canal) num período.
   */
  getSalesHeatmap(
    startDate: Date,
    endDate: Date
  ): Promise<SalesHeatmapDTO[]>;

  /**
   * Busca o faturamento e o volume de transações agrupado por tipo de pagamento num período.
   */
  getSalesByPaymentType(
    startDate: Date,
    endDate: Date
  ): Promise<SalesByPaymentTypeDTO[]>;

  /**
   * Busca a análise RFM (Recência, Frequência, Valor) dos clientes num período.
   */
  getCustomerRFM(
    startDate: Date,
    endDate: Date
  ): Promise<CustomerRFMDTO[]>;
}

