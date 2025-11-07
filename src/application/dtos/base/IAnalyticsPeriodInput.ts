export interface IAnalyticsPeriodInput {
  /**
   * ID do restaurante para filtrar a análise.
   */
  restaurantId: string;

  startDate: Date;
  endDate: Date;
}