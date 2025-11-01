import { IAnalyticsRepository, CustomerRFMDTO } from "@/domain/repositories/IAnalyticsRepository";
import { IGetCustomerRFMInput } from "../../dtos/IGetCustomerRFMInput";

/**
 * Orquestra a lógica de negócio para buscar a análise RFM (Recência, Frequência, Valor).
 */
export class GetCustomerRFMUseCase {
  
  // Injeção de dependência via construtor
  constructor(
    private analyticsRepository: IAnalyticsRepository
  ) {}

  /**
   * Executa o caso de uso.
   * @param input Contém os filtros (datas) para a consulta.
   */
  async execute(input: IGetCustomerRFMInput): Promise<CustomerRFMDTO[]> {
    // 1. Validação da regra de negócio da aplicação
    if (input.endDate < input.startDate) {
      throw new Error("Data final não pode ser anterior à data inicial.");
    }

    // 2. Delegação para a camada de persistência (via interface)
    const rfmData = await this.analyticsRepository.getCustomerRFM(
      input.startDate,
      input.endDate
    );

    // 3. Lógica adicional (ex: calcular pontuações RFM) pode ser feita aqui.
    // Por agora, retornamos os dados brutos.

    return rfmData;
  }
}
