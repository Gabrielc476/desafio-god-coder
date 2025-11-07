export interface IUpdateProductInput {
  /**
   * ID do restaurante para garantir a propriedade.
   */
  restaurantId: string;
  id: number;
  name?: string;
  price?: number;
}