/**
 * DTO de entrada (Input) para o UpdateChannelUseCase.
 */
export interface IUpdateChannelInput {
  /**
   * ID do restaurante para garantir a propriedade.
   */
  restaurantId: string;
  id: number;
  name?: string;
}