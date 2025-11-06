import { IAnalyticsPeriodInput } from '../base/IAnalyticsPeriodInput';

/**
 * DTO de entrada (Input) para o GetTopProductsUseCase.
 */
export interface IGetTopProductsInput extends IAnalyticsPeriodInput {
  // filtros futuros: channel?: string
}