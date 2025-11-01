import { IAssistantService, AssistantResponseDTO, ChatHistory, FunctionCallDTO } from "@/domain/services/IAssistantService";
import { IAskGeminiInput } from "../../dtos/IAskGeminiInput";
import { GetTopProductsUseCase } from "../analytics/GetTopProductsUseCase";
import { GetRevenueOverTimeUseCase } from "../analytics/GetRevenueOverTimeUseCase";
import { GetSalesByChannelUseCase } from "../analytics/GetSalesByChannelUseCase";
import { GetOverallAverageTicketUseCase } from "../analytics/GetOverallAverageTicketUseCase";
import { GetSalesHeatmapUseCase } from "../analytics/GetSalesHeatmapUseCase";
import { GetSalesByPaymentTypeUseCase } from "../analytics/GetSalesByPaymentTypeUseCase";
import { GetCustomerRFMUseCase } from "../analytics/GetCustomerRFMUseCase";
import { Granularity } from "@/domain/repositories/IAnalyticsRepository";

const MAX_CHAT_ITERATIONS = 5; // Segurança contra loops infinitos

/**
 * Orquestra a conversa com o assistente de IA (Gemini), atuando
 * como o "cérebro" que chama as ferramentas analíticas (outros Casos de Uso)
 * quando a IA solicita.
 */
export class AskGeminiAnalyticsUseCase {

  // Injeção de todas as dependências (Serviço de IA + Casos de Uso Analíticos)
  constructor(
    private assistantService: IAssistantService,
    private getTopProductsUseCase: GetTopProductsUseCase,
    private getRevenueOverTimeUseCase: GetRevenueOverTimeUseCase,
    private getSalesByChannelUseCase: GetSalesByChannelUseCase,
    private getOverallAverageTicketUseCase: GetOverallAverageTicketUseCase,
    private getSalesHeatmapUseCase: GetSalesHeatmapUseCase,
    private getSalesByPaymentTypeUseCase: GetSalesByPaymentTypeUseCase,
    private getCustomerRFMUseCase: GetCustomerRFMUseCase
  ) { }

  /**
   * Executa o caso de uso de chat com IA.
   * Este método gere o loop de "Function Calling".
   */
  async execute(input: IAskGeminiInput): Promise<string> {
    const { prompt, history = [] } = input;
    
    const conversationHistory: ChatHistory[] = [...history]; 
    
    let currentPrompt: string = prompt; // O prompt inicial do utilizador
    let iterations = 0;

    console.log(`[AskGemini] Iniciando novo chat. Prompt inicial: "${prompt}"`);

    // O loop gere a conversa. Pode ter múltiplas chamadas de função.
    while (iterations < MAX_CHAT_ITERATIONS) {
      iterations++;
      
      console.log(`[AskGemini] Iteração ${iterations}/${MAX_CHAT_ITERATIONS}. Enviando prompt (ou resultado da função) para a IA.`);

      // 1. Enviar o prompt ATUAL e o histórico ANTERIOR para o Gemini
      // --- CORREÇÃO (Bug de Ponteiro Mutável) ---
      // Passar uma CÓPIA RASA ([...]) do histórico para o mock.
      // Isto garante que o Jest testa o array *naquele momento*,
      // antes de o mutarmos com .push() abaixo.
      const aiResponse = await this.assistantService.generateFunctionCallResponse(
        currentPrompt, 
        [...conversationHistory] // Enviar uma cópia do histórico
      );
      // --- FIM DA CORREÇÃO ---

      // 2. Adicionar o prompt que *acabamos* de enviar ao histórico
      conversationHistory.push({ role: 'user', parts: currentPrompt });

      // 3. Se a IA deu uma resposta de texto final, adicione-a ao histórico e retorne-a.
      if (aiResponse.type === 'TEXT') {
        const textResponse = aiResponse.textResponse || "";
        conversationHistory.push({ role: 'model', parts: textResponse });
        console.log(`[AskGemini] Resposta de TEXTO recebida. Fim do loop.`);
        return textResponse; // FIM DO LOOP
      }

      // 4. Se a IA pediu para chamar uma função...
      if (aiResponse.type === 'FUNCTION_CALL') {
        const fnCall = aiResponse.functionCall;
        if (!fnCall) {
          throw new Error('Resposta de IA indicou FUNCTION_CALL mas não forneceu a função.');
        }
        
        console.log(`[AskGemini] IA solicitou FUNCTION_CALL: ${fnCall.name} com args: ${JSON.stringify(fnCall.args)}`);

        // Adicionar o pedido da IA (modelo) ao histórico
        conversationHistory.push({
          role: 'model',
          parts: `[FunctionCall: ${fnCall.name}]`,
        });

        // 5. Executar a função local correspondente
        const functionResult = await this.callLocalFunction(fnCall);
        const functionResultJson = JSON.stringify(functionResult);

        // 6. Adicionar o *resultado* da função ao histórico
        conversationHistory.push({
          role: 'user', 
          parts: functionResultJson,
        });

        // 7. Definir o próximo prompt como a instrução para a IA
        currentPrompt = `Com base nestes dados (JSON) que você solicitou: ${functionResultJson}. Responda à pergunta original do usuário de forma amigável.`;
        
        // O loop continua...
      } else {
        // Se a IA não retornar nem TEXTO nem FUNCTION_CALL
        console.error("[AskGemini] ERRO: Resposta inesperada da IA (nem TEXTO, nem FUNCTION_CALL).");
        throw new Error("Resposta inesperada do assistente de IA.");
      }
    }
    
    // Se sair do loop por excesso de iterações
    console.error(`[AskGemini] ERRO: Loop infinito detectado. Limite de ${MAX_CHAT_ITERATIONS} iterações atingido.`);
    console.error(`[AskGemini] Histórico da Conversa no momento da falha:`, JSON.stringify(conversationHistory, null, 2));
    
    throw new Error(
      `O assistente de IA excedeu o limite de ${MAX_CHAT_ITERATIONS} iterações. ` +
      `Verifique o log do servidor para o histórico completo da conversa.`
    );
  }

  /**
   * Um 'router' privado que chama o Caso de Uso analítico correto
   * com base no nome da função que o Gemini solicitou.
   */
  private async callLocalFunction(fnCall: FunctionCallDTO): Promise<any> {
    const { name, args } = fnCall;

    // --- CORREÇÃO (Timezone/Período) ---
    const parseDates = (args: any) => {
      const now = new Date();
      // Ajustar a data de "hoje" para o fuso local (ex: Brasil -03:00)
      const offset = now.getTimezoneOffset() * 60000;
      const localNow = new Date(now.getTime() - offset);
      const today = localNow.toISOString().split('T')[0]; // '2025-11-01' (local)

      const argStartDate = args.startDate || today;
      const argEndDate = args.endDate || args.startDate || today;

      // Início do dia (local)
      const startDate = new Date(argStartDate + 'T00:00:00.000'); 
      
      // Fim do dia (local)
      const endDate = new Date(argEndDate + 'T23:59:59.999');

      console.log(`[AskGemini] Datas da query (locais): ${startDate.toISOString()} a ${endDate.toISOString()}`);
      
      return { startDate, endDate };
    };
    // --- FIM DA CORREÇÃO ---

    try {
      switch (name) {
        case 'getTopSellingProducts':
          return await this.getTopProductsUseCase.execute(parseDates(args));

        case 'getRevenueOverTime':
          return await this.getRevenueOverTimeUseCase.execute({
            ...parseDates(args),
            granularity: (args.granularity || 'day') as Granularity, // Definir 'day' como padrão
          });

        case 'getSalesByChannel':
          return await this.getSalesByChannelUseCase.execute(parseDates(args));

        case 'getOverallAverageTicket':
          return await this.getOverallAverageTicketUseCase.execute(parseDates(args));

        case 'getSalesHeatmap':
          return await this.getSalesHeatmapUseCase.execute(parseDates(args));

        case 'getSalesByPaymentType':
          return await this.getSalesByPaymentTypeUseCase.execute(parseDates(args));

        case 'getCustomerRFM':
          return await this.getCustomerRFMUseCase.execute(parseDates(args));

        default:
          console.warn(`[AskGemini] IA tentou chamar uma função desconhecida: ${name}`);
          return { error: `Função '${name}' não conhecida.` };
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`[AskGemini] Erro ao executar a função local '${name}': ${error.message}`);
        return { error: `Erro ao executar a função '${name}': ${error.message}` };
      }
      console.error(`[AskGemini] Erro desconhecido ao executar a função local '${name}'.`);
      return { error: `Erro desconhecido ao executar a função local '${name}'.` };
    }
  }
}

