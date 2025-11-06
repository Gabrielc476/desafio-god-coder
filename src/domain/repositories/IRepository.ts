/**
 * Define uma entidade base que possui um identificador.
 * Todas as entidades de domínio (Customer, Product, etc.) devem ter um 'id'.
 */
export interface BaseEntity {
  id: number | string;
}

/**
 * Define um filtro genérico para consultas.
 * Permite passar condições dinâmicas para os métodos de busca.
 */
export type Where<T> = {
  [P in keyof T]?: T[P] | { contains: string } | { gte: Date } | { lte: Date };
};

/**
 * Interface genérica para um repositório de operações CRUD.
 * Abstrai o acesso a dados para qualquer entidade que estenda BaseEntity.
 * Segue os princípios da Arquitetura Limpa, permitindo que a camada de
 * aplicação dependa desta abstração, e não de uma implementação concreta.
 */
export interface IRepository<T extends BaseEntity> {
  create(data: Omit<T, 'id'>): Promise<T>;
  findById(id: T['id']): Promise<T | null>;
  find(where: Where<T>): Promise<T[]>;
  findAll(): Promise<T[]>;
  update(id: T['id'], data: Partial<Omit<T, 'id'>>): Promise<T | null>;
  delete(id: T['id']): Promise<boolean>;
}