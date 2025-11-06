import { IAnalyticsRepository } from '@/domain/repositories/IAnalyticsRepository';
import { IGetSalesByChannelInput } from '../../dtos/IGetSalesByChannelInput';
import { SalesByChannelDTO } from '@/domain/dtos/SalesByChannelDTO';


/**
 * Orquestra a lógica de negócio para buscar as vendas por canal.
 */
export class GetSalesByChannelUseCase {
  
  // O UseCase depende da *interface* do domínio, não da infra.
  constructor(
    private analyticsRepository: IAnalyticsRepository
  ) {}

  /**
   * Executa o caso de uso.
   * @param input Contém os filtros (datas) para a consulta.
   */
  async execute(input: IGetSalesByChannelInput): Promise<SalesByChannelDTO[]> {
    
    // 1. Validação da regra de negócio da aplicação
    if (input.endDate < input.startDate) {
      throw new Error("Data final não pode ser anterior à data inicial.");
    }

    // 2. Delegação para a camada de persistência (via interface)
    const salesByChannel = await this.analyticsRepository.getSalesByChannel(
      input.startDate,
      input.endDate
    );

    return salesByChannel;
  }
}
