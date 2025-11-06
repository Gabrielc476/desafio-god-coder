import { Product } from '@/domain/entities/Product';
import { IRepository } from '@/domain/repositories/IRepository';
import { IDeactivateProductInput } from '@/application/dtos/IDeactivateProductInput';

/**
 * Caso de uso para desativar um produto (Soft Delete).
 * Em vez de deletar, marca o produto como inativo.
 */
export class DeactivateProductUseCase {
  constructor(private productRepository: IRepository<Product>) {}

  /**
   * Executa o caso de uso.
   * @param input Contém o ID do produto a ser desativado.
   * @returns O produto atualizado para o estado inativo.
   */
  async execute(input: IDeactivateProductInput): Promise<Product | null> {
    if (!input.id) {
      throw new Error('O ID do produto é obrigatório.');
    }

    // A regra de negócio agora é simplesmente marcar como inativo.
    return this.productRepository.update(input.id, { active: false });
  }
}