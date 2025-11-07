/**
 * DTO de entrada (Input) para o FindChannelUseCase.
 */
export interface IFindChannelInput {
  /**
   * ID do restaurante para garantir a propriedade.
   */
  restaurantId: string;
  id: number;
}