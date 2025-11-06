// Define o "contrato" de dados que a aplicação espera.
// Não depende de nenhuma camada externa (ex: aplicação ou infra).

import { CustomerRFMDTO } from '../dtos/CustomerRFMDTO';
import { OverallAverageTicketDTO } from "../dtos/OverallAverageTicketDTO"
import { RevenueOverTimeDTO } from '../dtos/RevenueOverTimeDTO';
import { SalesByChannelDTO } from '../dtos/SalesByChannelDTO';
import { SalesByPaymentTypeDTO } from '../dtos/SalesByPaymentTypeDTO';
import { SalesHeatmapDTO } from '../dtos/SalesHeatmapDTO';
import { TopProductDTO } from '../dtos/TopProductDTO';

// O tipo Granularity é definido aqui, na camada de Domínio,
// pois é usado pelo contrato da interface.
export type Granularity = 'day' | 'week' | 'month';

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
