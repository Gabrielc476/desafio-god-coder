// --- DTOs (Data Transfer Objects) para o Serviço de Assistente ---

/**
 * Define uma entrada no histórico de chat.
 * O 'role' deve ser 'user' para o utilizador ou 'model' para a IA.
 */
export type ChatHistory = {
  role: 'user' | 'model';
  parts: string; // O conteúdo de texto daquela parte da conversa
};

/**
 * Define a "ferramenta" (função) que a IA pode solicitar que o nosso
 * backend execute (ex: 'getTopProducts').
 */
export type FunctionCallDTO = {
  name: string;
  args: any; // Argumentos (ex: { startDate: '...', endDate: '...' })
};

/**
 * Define a resposta do assistente para o Caso de Uso 8 (Chatbot).
 * Pode ser um texto simples ou um pedido para executar uma função.
 */
export type AssistantResponseDTO = {
  type: 'TEXT' | 'FUNCTION_CALL';
  textResponse?: string; // Presente se type === 'TEXT'
  functionCall?: FunctionCallDTO; // Presente se type === 'FUNCTION_CALL'
};


// --- A Interface (O Contrato) ---

/**
 * Define o contrato para um serviço de assistente de IA.
 * A Camada de Aplicação (Casos de Uso) depende desta interface,
 * e não de uma implementação concreta (como o Gemini).
 */
export interface IAssistantService {
  /**
   * (Caso de Uso 8) Gera uma resposta (texto ou chamada de função)
   * com base no prompt do utilizador e no histórico do chat.
   */
  generateFunctionCallResponse(
    prompt: string,
    history: ChatHistory[]
  ): Promise<AssistantResponseDTO>;
  
  /**
   * (Caso de Uso 9) Gera uma análise (apenas texto) de um conjunto de
   * dados JSON fornecido.
   *
   * @param dataContext O "título" dos dados (ex: "Top Produtos Vendidos")
   * @param dataJson O JSON dos dados a serem analisados.
   */
   explainData(
     dataContext: string,
     dataJson: string
   ): Promise<string>; // Retorna apenas o texto da análise
}
