import { ChatHistory } from "@/domain/services/IAssistantService";

/**
 * DTO (Data Transfer Object) para a entrada do AskGeminiAnalyticsUseCase.
 * Define a forma dos dados que o Caso de Uso espera.
 */
export interface IAskGeminiInput {
  /**
   * O prompt/pergunta atual do usuário (ex: "Qual meu top produto?").
   */
  prompt: string;

  /**
   * O histórico da conversa (opcional), para manter o contexto.
   */
  history?: ChatHistory[];
}