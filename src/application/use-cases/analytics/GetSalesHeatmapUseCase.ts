// 1. Importar o DTO de Input
import { IGetSalesHeatmapInput } from "@/application/dtos/IGetSalesHeatmapInput";
// 2. Importar o DTO de Output e a Interface (Contrato) do Domínio
import {
  IAnalyticsRepository,
  
} from "@/domain/repositories/IAnalyticsRepository";

import { SalesHeatmapDTO } from "@/domain/dtos/SalesHeatmapDTO";

/**
 * Orquestra a lógica de negócio para buscar o heatmap de vendas (agrupado por hora e canal).
 */
export class GetSalesHeatmapUseCase {
  // Injeção de dependência via construtor
  constructor(
    private analyticsRepository: IAnalyticsRepository
  ) { }

  /**
   * Executa o caso de uso.
   * @param input Contém os filtros (datas) para a consulta.
   */
  async execute(input: IGetSalesHeatmapInput): Promise<SalesHeatmapDTO[]> {
    // 1. Validação da regra de negócio da aplicação
    if (input.endDate < input.startDate) {
      throw new Error("Data final não pode ser anterior à data inicial.");
    }

    // 2. Delegação para a camada de persistência
    const heatmapData = await this.analyticsRepository.getSalesHeatmap(
      input.startDate,
      input.endDate
    );

    return heatmapData;
  }
}
