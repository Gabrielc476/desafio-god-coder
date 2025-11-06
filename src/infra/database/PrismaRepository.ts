import { Prisma, PrismaClient } from '@prisma/client';
import {
  BaseEntity,
  IRepository,
  Where,
} from '@/domain/repositories/IRepository';

/**
 * Implementação genérica do IRepository usando Prisma.
 * Esta classe pode ser usada para qualquer modelo do Prisma,
 * fornecendo operações CRUD básicas de forma reutilizável.
 *
 * @template T A entidade do domínio (ex: Customer).
 * @template K O nome do modelo no Prisma (ex: 'customer').
 * @template M O tipo do delegate do modelo Prisma (ex: Prisma.CustomerDelegate).
 */
export class PrismaRepository<
  T extends BaseEntity,
  K extends keyof PrismaClient & Uncapitalize<Prisma.ModelName>,
  M extends PrismaClient[K]
> implements IRepository<T> {
  // O 'model' é uma referência ao delegado do Prisma (ex: prisma.customer)
  // Agora é totalmente tipado, permitindo autocompletar e segurança.
  private model: M;

  constructor(prisma: PrismaClient, modelName: K) {
    this.model = prisma[modelName] as M;
    if (!this.model) {
      throw new Error(`Modelo '${String(modelName)}' não encontrado no cliente Prisma.`);
    }
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    // @ts-ignore - 'data' é compatível, mas o tipo genérico complexo confunde o TS aqui.
    return this.model.create({ data }) as Promise<T>;
  }

  async findById(id: T['id']): Promise<T | null> {
    // @ts-ignore - O tipo do 'id' é compatível.
    return this.model.findUnique({ where: { id } }) as Promise<T | null>;
  }

  async find(where: Where<T>): Promise<T[]> {
    // @ts-ignore - O tipo do 'where' é compatível, mas o TS não consegue resolver a união de delegates.
    return this.model.findMany({ where }) as Promise<T[]>;
  }

  async findAll(): Promise<T[]> {
    // @ts-ignore - O TS não consegue resolver a união de delegates para uma chamada sem argumentos.
    return this.model.findMany() as Promise<T[]>;
  }

  async update(id: T['id'], data: Partial<Omit<T, 'id'>>): Promise<T | null> {
    try {
      // @ts-ignore - Tipos são compatíveis.
      return await this.model.update({ where: { id }, data }) as Promise<T>;
    } catch (error) {
      // O Prisma lança um erro se o registro a ser atualizado não for encontrado
      return null;
    }
  }

  async delete(id: T['id']): Promise<boolean> {
    try {
      // @ts-ignore - O tipo do 'id' é compatível.
      await this.model.delete({ where: { id } });
      return true;
    } catch (error) {
      // O Prisma lança um erro se o registro a ser deletado não for encontrado
      return false;
    }
  }
}