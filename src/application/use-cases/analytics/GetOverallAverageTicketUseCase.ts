import { IAnalyticsRepository, OverallAverageTicketDTO } from "@/domain/repositories/IAnalyticsRepository";
import { IGetOverallAverageTicketInput } from "@/application/dtos/IGetOverallAverageTicketInput";

/**
 * Orquestra a lógica de negócio para buscar o ticket médio geral.
 */
export class GetOverallAverageTicketUseCase {

  // Injeção de dependência via construtor
  constructor(
    private analyticsRepository: IAnalyticsRepository
  ) { }

  /**
   * Executa o caso de uso.
   * @param input Contém os filtros (datas) para a consulta.
   */
  async execute(input: IGetOverallAverageTicketInput): Promise<OverallAverageTicketDTO> {
    // 1. Validação da regra de negócio da aplicação
    if (input.endDate < input.startDate) {
      throw new Error("Data final não pode ser anterior à data inicial.");
    }

    // 2. Delegação para a camada de persistência (via interface)
    const averageTicketData = await this.analyticsRepository.getOverallAverageTicket(
      input.startDate,
      input.endDate
    );

    // 3. CORREÇÃO: Lidar com o caso 'null'
    // Se o repositório retornar 'null' (ex: sem vendas no período),
    // o caso de uso deve retornar um DTO padrão (regra de negócio da app).
    if (!averageTicketData) {
      return {
        averageTicket: 0,
        totalSales: 0
      };
    }

    return averageTicketData;
  }
}
