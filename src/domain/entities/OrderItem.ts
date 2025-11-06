import { BaseEntity } from '../repositories/IRepository';

export interface OrderItem extends BaseEntity {
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
}