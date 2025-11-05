import { Customer } from './Customer';
import { Product } from './Product';
import { Channel } from './Channel';
import { PaymentType } from './PaymentType';

export class Order {
  constructor(
    public readonly id: number,
    public readonly customer: Customer,
    public readonly items: OrderItem[],
    public readonly channel: Channel,
    public readonly paymentType: PaymentType,
    public readonly createdAt: Date,
  ) {}

  get total(): number {
    return this.items.reduce((total, item) => total + item.total, 0);
  }
}

export class OrderItem {
  constructor(
    public readonly product: Product,
    public readonly quantity: number,
    public readonly price: number,
  ) {}

  get total(): number {
    return this.quantity * this.price;
  }
}
