import { Request, Response } from 'express';
import { AskGeminiAnalyticsUseCase } from '@/application/use-cases/ai/AskGeminiAnalyticsUseCase';
import { IAskGeminiInput } from '@/application/dtos/IAskGeminiInput';
import { ExplainAnalyticsDataUseCase } from '@/application/use-cases/ai/ExplainAnalyticsDataUseCase';
import { IExplainDataInput } from '@/application/dtos/IExplainDataInput';

/**
 * Controller (camada de Infra) para lidar com requisições HTTP
 * relacionadas à IA (Casos de Uso 8 e 9).
 */
export class AIController {

  // Injeção de dependência dos casos de uso de IA
  constructor(
    private askGeminiAnalyticsUseCase: AskGeminiAnalyticsUseCase,
    private explainAnalyticsDataUseCase: ExplainAnalyticsDataUseCase // Adicionado
  ) { }

  /**
   * (Caso de Uso 8) Lida com o endpoint POST /api/v1/ai/ask
   * Recebe um prompt e (opcionalmente) um histórico.
   */
  async ask(req: Request, res: Response): Promise<Response> {
    const { prompt, history } = req.body as IAskGeminiInput;

    // 1. Validação básica de entrada
    if (!prompt) {
      return res.status(400).json({ error: 'O "prompt" é obrigatório.' });
    }

    try {
      // 2. Executar o caso de uso "mestre"
      const responseText = await this.askGeminiAnalyticsUseCase.execute({
        prompt,
        history: history || [], // Garantir que o histórico seja um array
      });

      // 3. Retornar a resposta de texto final da IA
      return res.status(200).json({ response: responseText });

    } catch (error) {
      // Capturar erros (ex: falhas de API, loops infinitos)
      const errorMessage = (error instanceof Error) ? error.message : 'Erro desconhecido';
      console.error(`Erro no AIController.ask: ${errorMessage}`, error);
      return res.status(500).json({ error: errorMessage });
    }
  }

  /**
   * (Caso de Uso 9) Lida com o endpoint POST /api/v1/ai/explain
   * Recebe um JSON de dados e um contexto.
   */
  async explain(req: Request, res: Response): Promise<Response> {
    const { dataContext, dataJson } = req.body as IExplainDataInput;

    // 1. Validação básica de entrada
    if (!dataContext || !dataJson) {
      return res.status(400).json({ error: 'O "dataContext" e "dataJson" são obrigatórios.' });
    }

    try {
      // 2. Executar o caso de uso "explainer"
      const explanationText = await this.explainAnalyticsDataUseCase.execute({
        dataContext,
        dataJson,
      });

      // --- *** LOG ADICIONADO *** ---
      // Vamos logar o objeto exato que estamos enviando de volta
      const responseObject = { explanation: explanationText };
      console.log('--- [AIController] Objeto de resposta enviado para o frontend: ---');
      console.log(JSON.stringify(responseObject, null, 2));
      console.log('---------------------------------------------------------------');
      // --- *** FIM DO LOG *** ---

      // 3. Retornar a explicação em texto
      return res.status(200).json(responseObject); // Modificado para usar a variável do log

    } catch (error) {
      // Capturar erros
      const errorMessage = (error instanceof Error) ? error.message : 'Erro desconhecido';
      console.error(`Erro no AIController.explain: ${errorMessage}`, error);
      return res.status(500).json({ error: errorMessage });
    }
  }
}