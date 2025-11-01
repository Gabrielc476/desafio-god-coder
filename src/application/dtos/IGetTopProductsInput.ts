/**
 * DTO de entrada (Input) para o GetTopProductsUseCase.
 * Define a forma dos dados que o caso de uso espera.
 */
export interface IGetTopProductsInput {
  startDate: Date;
  endDate: Date;
  // filtros futuros: channel?: string
}
