export interface ICreateProductInput {
  /**
   * ID do restaurante ao qual este produto pertence.
   */
  restaurantId: string;
  name: string;
  price: number;
}