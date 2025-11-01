/**
 * DTO de entrada (Input) para o GetRevenueOverTimeUseCase.
 * Define a forma dos dados que o caso de uso espera.
 */
export interface IGetRevenueOverTimeInput {
  startDate: Date;
  endDate: Date;
  granularity: string; // Recebemos string para validar
}
