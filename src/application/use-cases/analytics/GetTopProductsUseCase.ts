// Importamos o CONTRATO (Interface) do Domínio, não a implementação.
import { IAnalyticsRepository } from '@/domain/repositories/IAnalyticsRepository';
import { TopProductDTO } from '@/domain/dtos/TopProductDTO';
import { IGetTopProductsInput } from '../../dtos/IGetTopProductsInput'; // Importado do novo local

// A interface IGetTopProductsInput foi removida daqui

/**
 * Orquestra a lógica de negócio para buscar os produtos mais vendidos.
 * Depende de uma abstração (IAnalyticsRepository) e não de uma
 * implementação concreta.
 */
export class GetTopProductsUseCase {
  // Injeção de dependência via construtor.
  // O UseCase depende da *interface* do domínio, não da infra.
  constructor(private analyticsRepository: IAnalyticsRepository) {}

  /**
   * Executa o caso de uso.
   * @param input Contém os filtros (datas) para a consulta.
   * @returns Uma promessa com a lista dos produtos mais vendidos.
   */
  async execute(input: IGetTopProductsInput): Promise<TopProductDTO[]> {
    // 1. Validação da regra de negócio da aplicação
    if (input.endDate < input.startDate) {
      // Esta é uma regra de negócio da aplicação, não do domínio.
      throw new Error('Data final não pode ser anterior à data inicial.');
    }

    // 2. Delegação para a camada de persistência (via interface)
    const topProducts = await this.analyticsRepository.getTopSellingProducts(
      input.startDate,
      input.endDate
    );

    // 3. Lógica adicional (se necessário) antes de retornar.
    // ex: enriquecimento ou formatação dos dados.

    return topProducts;
  }
}
