/**
 * DTO (Data Transfer Object) para a entrada do GetSalesHeatmapUseCase.
 * Define a forma dos dados que o Caso de Uso espera.
 */
export interface IGetSalesHeatmapInput {
  startDate: Date;
  endDate: Date;
}
