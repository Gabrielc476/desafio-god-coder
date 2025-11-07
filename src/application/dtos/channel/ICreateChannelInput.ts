/**
 * DTO de entrada (Input) para o CreateChannelUseCase.
 */
export interface ICreateChannelInput {
  /**
   * ID do restaurante ao qual este canal pertence.
   */
  restaurantId: string;
  name: string;
}