/**
 * DTO de entrada (Input) para o DeactivateChannelUseCase.
 */
export interface IDeactivateChannelInput {
  /**
   * ID do restaurante para garantir a propriedade.
   */
  restaurantId: string;
  id: number;
}