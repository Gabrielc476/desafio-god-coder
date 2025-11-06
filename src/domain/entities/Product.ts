import { BaseEntity } from '../repositories/IRepository';

export interface Product extends BaseEntity {
  id: number;
  name: string;
  price: number;
  active: boolean;
}