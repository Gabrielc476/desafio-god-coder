import { Product } from '@/domain/entities/Product';
import { IRepository } from '@/domain/repositories/IRepository';
import { ICreateProductInput } from '@/application/dtos/product/ICreateProductInput';

/**
 * Caso de uso para criar um novo produto.
 * Orquestra a lógica de negócio e as validações antes de persistir os dados.
 */
export class CreateProductUseCase {
  // Injetamos o repositório genérico, tipado para a entidade Product.
  // O caso de uso não sabe se é Prisma, Dapper ou qualquer outro ORM.
  constructor(private productRepository: IRepository<Product>) {}

  /**
   * Executa o caso de uso.
   * @param input Os dados do novo produto.
   * @returns O produto que foi criado.
   */
  async execute(input: ICreateProductInput): Promise<Product> {
    // 1. Validação de Regras de Negócio
    if (!input.name || input.name.trim() === '') {
      throw new Error('O nome do produto é obrigatório.');
    }
    if (input.price <= 0) {
      throw new Error('O preço do produto deve ser um valor positivo.');
    }

    // Regra de Negócio: Garantir a unicidade do nome do produto.
    const existingProduct = await this.productRepository.find({
      name: input.name,
    });
    if (existingProduct.length > 0) {
      throw new Error(`Um produto com o nome '${input.name}' já existe.`);
    }

    // 2. Delegação para a camada de persistência
    const productData = { ...input, active: true };
    const newProduct = await this.productRepository.create(productData);

    return newProduct;
  }
}