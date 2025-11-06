import { IAnalyticsRepository } from "@/domain/repositories/IAnalyticsRepository";
import { IGetSalesByPaymentTypeInput } from "@/application/dtos/analytics/IGetSalesByPaymentTypeInput";
import { SalesByPaymentTypeDTO } from "@/domain/dtos/SalesByPaymentTypeDTO";

/**
 * Orquestra a lógica de negócio para buscar as vendas por tipo de pagamento.
 * Segue os princípios da Arquitetura Limpa [cite: Arquitetura Limpa - O Guia do Artesão para Estrutura e Design de Software - Autor (Robert C. Martin).pdf].
 */
export class GetSalesByPaymentTypeUseCase {

  // Injeção de dependência via construtor (depende da abstração, não da implementação)
  constructor(
    private analyticsRepository: IAnalyticsRepository
  ) { }

  /**
   * Executa o caso de uso.
   * @param input Contém os filtros (datas) para a consulta.
   * @returns Uma promessa com a lista de vendas agrupadas por tipo de pagamento.
   */
  async execute(input: IGetSalesByPaymentTypeInput): Promise<SalesByPaymentTypeDTO[]> {
    // 1. Validação da regra de negócio da aplicação
    if (input.endDate < input.startDate) {
      throw new Error("Data final não pode ser anterior à data inicial.");
    }

    // 2. Delegação para a camada de persistência (via interface)
    const salesByPaymentType = await this.analyticsRepository.getSalesByPaymentType(
      input.startDate,
      input.endDate
    );

    // 3. Retorno
    return salesByPaymentType;
  }
}
