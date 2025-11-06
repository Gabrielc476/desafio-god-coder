import { Product } from '@/domain/entities/Product';
import { IRepository } from '@/domain/repositories/IRepository';
import { IFindProductInput } from '@/application/dtos/product/IFindProductInput';

/**
 * Caso de uso para buscar um único produto pelo seu ID.
 */
export class FindProductUseCase {
  constructor(private productRepository: IRepository<Product>) {}

  /**
   * Executa o caso de uso.
   * @param input Contém o ID do produto a ser buscado.
   * @returns O produto encontrado ou null se não existir.
   */
  async execute(input: IFindProductInput): Promise<Product | null> {
    if (!input.id) {
      throw new Error('O ID do produto é obrigatório.');
    }

    return this.productRepository.findById(input.id);
  }
}