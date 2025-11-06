import { Product } from '@/domain/entities/Product';
import { IRepository } from '@/domain/repositories/IRepository';
import { IUpdateProductInput } from '@/application/dtos/product/IUpdateProductInput';

/**
 * Caso de uso para atualizar um produto existente.
 * Orquestra a lógica de negócio e as validações antes de persistir a alteração.
 */
export class UpdateProductUseCase {
  // Injetamos o repositório genérico, mantendo a abstração.
  constructor(private productRepository: IRepository<Product>) {}

  /**
   * Executa o caso de uso.
   * @param input Os dados para atualização, incluindo o ID do produto.
   * @returns O produto atualizado ou null se o produto não for encontrado.
   */
  async execute(input: IUpdateProductInput): Promise<Product | null> {
    // 1. Validação de Regras de Negócio
    if (input.name !== undefined && input.name.trim() === '') {
      throw new Error('O nome do produto não pode ser vazio.');
    }
    if (input.price !== undefined && input.price <= 0) {
      throw new Error('O preço do produto deve ser um valor positivo.');
    }

    // Regra de Negócio: Garantir a unicidade do nome ao atualizar.
    if (input.name) {
      const existingProduct = await this.productRepository.find({
        name: input.name,
      });
      // Se encontrou um produto com o mesmo nome, e o ID dele é diferente do que estamos atualizando...
      if (existingProduct.length > 0 && existingProduct[0].id !== input.id) {
        throw new Error(`O nome '${input.name}' já está em uso por outro produto.`);
      }
    }

    // 2. Separa o ID dos dados a serem atualizados
    const { id, ...dataToUpdate } = input;

    if (Object.keys(dataToUpdate).length === 0) {
      return this.productRepository.findById(id);
    }

    // 3. Delegação para a camada de persistência
    return this.productRepository.update(id, dataToUpdate);
  }
}