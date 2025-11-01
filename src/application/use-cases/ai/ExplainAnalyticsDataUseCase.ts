import { IExplainDataInput } from "../../dtos/IExplainDataInput";
import { IAssistantService } from "@/domain/services/IAssistantService";

/**
 * Orquestra a lógica de negócio para "explicar" um conjunto de dados JSON.
 * Este é o nosso Caso de Uso 9 (O "Analista").
 */
export class ExplainAnalyticsDataUseCase {
  
  // Injeção de dependência via construtor
  constructor(
    private assistantService: IAssistantService
  ) {}

  /**
   * Executa o caso de uso.
   * @param input Contém o contexto e o JSON dos dados a serem explicados.
   */
  async execute(input: IExplainDataInput): Promise<string> {
    const { dataContext, dataJson } = input;

    // 1. Validação (simples)
    if (!dataContext || !dataJson) {
      throw new Error("Contexto e JSON dos dados são obrigatórios.");
    }

    // 2. Delegação para o serviço de IA
    // O 'explainData' é o método no GeminiAssistantService (no Canvas)
    // que usa o prompt "Você é um analista de dados sênior...".
    const explanation = await this.assistantService.explainData(
      dataContext,
      dataJson
    );

    return explanation;
  }
}