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
    // --- LOG 1: INÍCIO DO CASO DE USO ---
    console.log('--- [Backend] ExplainAnalyticsDataUseCase: INICIADO ---');
    console.log(`[Backend] Contexto recebido: ${input.dataContext ? input.dataContext.substring(0, 100) + '...' : 'NULO'}`);
    console.log(`[Backend] JSON recebido: ${input.dataJson ? input.dataJson.substring(0, 100) + '...' : 'NULO'}`);
    // --- FIM DO LOG 1 ---

    const { dataContext, dataJson } = input;

    // 1. Validação (simples)
    if (!dataContext || !dataJson) {
      // --- LOG 2: ERRO DE VALIDAÇÃO ---
      console.error('[Backend] ERRO: Contexto ou JSON ausentes.');
      // --- FIM DO LOG 2 ---
      throw new Error("Contexto e JSON dos dados são obrigatórios.");
    }

    // 2. Delegação para o serviço de IA
    // O 'explainData' é o método no GeminiAssistantService (no Canvas)
    // que usa o prompt "Você é um analista de dados sênior...".
    const explanation = await this.assistantService.explainData(
      dataContext,
      dataJson
    );

    // --- LOG 3: EXPLICAÇÃO RECEBIDA DO SERVIÇO ---
    console.log(`[Backend] Explicação final recebida do serviço: ${explanation ? explanation.substring(0, 100) + '...' : 'VAZIA'}`);
    console.log('--- [Backend] ExplainAnalyticsDataUseCase: FINALIZADO ---');
    // --- FIM DO LOG 3 ---

    return explanation;
  }
}