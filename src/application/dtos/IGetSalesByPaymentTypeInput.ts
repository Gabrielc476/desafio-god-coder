/**
 * DTO (Data Transfer Object) para a entrada do GetSalesByPaymentTypeUseCase.
 * Define a forma dos dados que o Caso de Uso espera.
 */
export interface IGetSalesByPaymentTypeInput {
  startDate: Date;
  endDate: Date;
}
