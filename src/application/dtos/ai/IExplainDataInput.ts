/**
 * DTO (Data Transfer Object) para a entrada do ExplainAnalyticsDataUseCase.
 * Define a forma dos dados que o Caso de Uso espera.
 */
export interface IExplainDataInput {
  /**
   * O contexto para a IA (ex: "Top 10 Produtos", "Vendas por Canal").
   */
  dataContext: string;

  /**
   * Os dados reais em formato JSON stringificado.
   */
  dataJson: string;
}