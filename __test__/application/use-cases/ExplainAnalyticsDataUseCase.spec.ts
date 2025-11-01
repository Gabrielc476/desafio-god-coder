import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// O Caso de Uso que estamos a testar
import { ExplainAnalyticsDataUseCase } from '../../../src/application/use-cases/ai/ExplainAnalyticsDataUseCase';
import { IExplainDataInput } from '../../../src/application/dtos/IExplainDataInput';

// A dependência que precisamos de mockar
import { IAssistantService } from '../../../src/domain/services/IAssistantService';

// --- Mock do Serviço de IA (Gemini) ---
// Criamos um mock parcial, tipando explicitamente apenas o método que este caso de uso utiliza.
const mockAssistantService = {
  explainData: jest.fn<(
    dataContext: string, 
    dataJson: string
  ) => Promise<string>>(),
  // Note que 'generateFunctionCallResponse' foi omitido (desacoplado)
};

describe('ExplainAnalyticsDataUseCase', () => {
  let useCase: ExplainAnalyticsDataUseCase;

  beforeEach(() => {
    // Resetar apenas o mock que este teste usa
    mockAssistantService.explainData.mockReset();
    
    // Instanciar o caso de uso com o repositório mockado
    useCase = new ExplainAnalyticsDataUseCase(mockAssistantService as any);
  });

  it('deve chamar o serviço de IA e retornar a explicação', async () => {
    // Arrange
    const mockInput: IExplainDataInput = {
      dataContext: 'Top 10 Produtos da Semana',
      dataJson: '[{"name":"Pizza","revenue":500}]',
    };
    
    const mockExplanation = 'A Pizza foi o seu produto de maior receita, gerando R$ 500,00.';
    
    // Configurar o mock (agora corretamente tipado)
    mockAssistantService.explainData.mockResolvedValue(mockExplanation);

    // Act
    const result = await useCase.execute(mockInput);

    // Assert
    expect(result).toBe(mockExplanation);
    expect(mockAssistantService.explainData).toHaveBeenCalledTimes(1);
    expect(mockAssistantService.explainData).toHaveBeenCalledWith(
      mockInput.dataContext,
      mockInput.dataJson
    );
  });

  it('deve lançar um erro se o dataContext estiver em falta', async () => {
    // Arrange
    const mockInput: IExplainDataInput = {
      dataContext: '', // Em falta
      dataJson: '[{"name":"Pizza","revenue":500}]',
    };

    // Act & Assert
    // Usamos 'rejects' para testar se a promessa falha
    await expect(useCase.execute(mockInput))
      .rejects
      .toThrow('Contexto e JSON dos dados são obrigatórios.');

    // Garantir que o serviço de IA não foi chamado
    expect(mockAssistantService.explainData).not.toHaveBeenCalled();
  });

  it('deve lançar um erro se o dataJson estiver em falta', async () => {
    // Arrange
    const mockInput: IExplainDataInput = {
      dataContext: 'Top 10 Produtos',
      dataJson: '', // Em falta
    };

    // Act & Assert
    await expect(useCase.execute(mockInput))
      .rejects
      .toThrow('Contexto e JSON dos dados são obrigatórios.');

    // Garantir que o serviço de IA não foi chamado
    expect(mockAssistantService.explainData).not.toHaveBeenCalled();
  });
});
