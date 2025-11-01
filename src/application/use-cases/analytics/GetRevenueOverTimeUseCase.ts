import { IAnalyticsRepository, Granularity } from "@/domain/repositories/IAnalyticsRepository";
import { IGetRevenueOverTimeInput } from "../../dtos/IGetRevenueOverTimeInput";

// CORREÇÃO: Importado 'Granularity' em vez do nome errado 'RevenueOverTimeGranularity'

/**
 * Orquestra a lógica de negócio para buscar o faturamento ao longo do tempo.
 */
export class GetRevenueOverTimeUseCase {
  
  // Injeção de dependência via construtor
  constructor(
    private analyticsRepository: IAnalyticsRepository
  ) {}

  /**
   * Executa o caso de uso.
   * @param input Contém os filtros (datas, granularidade) para a consulta.
   */
  async execute(input: IGetRevenueOverTimeInput) {
    // 1. Validação da regra de negócio da aplicação
    if (input.endDate < input.startDate) {
      throw new Error("Data final não pode ser anterior à data inicial.");
    }

    // 2. Lógica de Negócio: Definir granularidade padrão
    const granularity = input.granularity || 'day';
    
    // Validação extra (opcional, mas boa prática)
    if (!['day', 'week', 'month'].includes(granularity)) {
      throw new Error("Granularidade inválida. Use 'day', 'week' ou 'month'.");
    }

    // 3. Delegação para a camada de persistência (via interface)
    const revenueOverTime = await this.analyticsRepository.getRevenueOverTime(
      input.startDate,
      input.endDate,
      granularity as Granularity // Garantir o tipo
    );

    return revenueOverTime;
  }
}

