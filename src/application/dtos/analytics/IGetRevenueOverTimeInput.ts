import { IAnalyticsPeriodInput } from '../base/IAnalyticsPeriodInput';



/**
 * DTO de entrada (Input) para o GetRevenueOverTimeUseCase.
 * Define a forma dos dados que o caso de uso espera.
 */
export interface IGetRevenueOverTimeInput extends  IAnalyticsPeriodInput {
  granularity: string; // Recebemos string para validar
}
