import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// O Caso de Uso que estamos a testar
import { AskGeminiAnalyticsUseCase } from '../../../src/application/use-cases/ai/AskGeminiAnalyticsUseCase';

// Dependências que precisamos de mockar
import { IAssistantService } from '../../../src/domain/services/IAssistantService';
import { GetTopProductsUseCase } from '../../../src/application/use-cases/analytics/GetTopProductsUseCase';
import { GetRevenueOverTimeUseCase } from '../../../src/application/use-cases/analytics/GetRevenueOverTimeUseCase';
import { GetSalesByChannelUseCase } from '../../../src/application/use-cases/analytics/GetSalesByChannelUseCase';
import { GetOverallAverageTicketUseCase } from '../../../src/application/use-cases/analytics/GetOverallAverageTicketUseCase';
import { GetSalesHeatmapUseCase } from '../../../src/application/use-cases/analytics/GetSalesHeatmapUseCase';
import { GetSalesByPaymentTypeUseCase } from '../../../src/application/use-cases/analytics/GetSalesByPaymentTypeUseCase';
import { GetCustomerRFMUseCase } from '../../../src/application/use-cases/analytics/GetCustomerRFMUseCase';
import { IGetTopProductsInput } from '../../../src/application/dtos/IGetTopProductsInput';

// --- Mocks dos Casos de Uso Analíticos ---
// Criamos mocks parciais com a tipagem explícita apenas no 'execute'

const mockGetTopProductsUseCase = {
  execute: jest.fn<GetTopProductsUseCase['execute']>(),
};
const mockGetRevenueOverTimeUseCase = {
  execute: jest.fn<GetRevenueOverTimeUseCase['execute']>(),
};
const mockGetSalesByChannelUseCase = {
  execute: jest.fn<GetSalesByChannelUseCase['execute']>(),
};
const mockGetOverallAverageTicketUseCase = {
  execute: jest.fn<GetOverallAverageTicketUseCase['execute']>(),
};
const mockGetSalesHeatmapUseCase = {
  execute: jest.fn<GetSalesHeatmapUseCase['execute']>(),
};
const mockGetSalesByPaymentTypeUseCase = {
  execute: jest.fn<GetSalesByPaymentTypeUseCase['execute']>(),
};
const mockGetCustomerRFMUseCase = {
  execute: jest.fn<GetCustomerRFMUseCase['execute']>(),
};

// --- Mock do Serviço de IA (Gemini) ---
const mockAssistantService = {
  generateFunctionCallResponse: jest.fn<IAssistantService['generateFunctionCallResponse']>(),
  explainData: jest.fn<IAssistantService['explainData']>(),
};

describe('AskGeminiAnalyticsUseCase', () => {
  let useCase: AskGeminiAnalyticsUseCase;

  beforeEach(() => {
    // Resetar todos os mocks antes de cada teste
    jest.resetAllMocks();

    // Instanciar o caso de uso "mestre" com todas as suas dependências mockadas
    useCase = new AskGeminiAnalyticsUseCase(
      mockAssistantService as any,
      mockGetTopProductsUseCase as any,
      mockGetRevenueOverTimeUseCase as any,
      mockGetSalesByChannelUseCase as any,
      mockGetOverallAverageTicketUseCase as any,
      mockGetSalesHeatmapUseCase as any,
      mockGetSalesByPaymentTypeUseCase as any,
      mockGetCustomerRFMUseCase as any
    );
  });

  it('deve retornar uma resposta de texto simples se a IA não pedir funções', async () => {
    // Arrange
    const prompt = 'Olá, como vai?';
    const expectedResponse = 'Olá! Estou bem, pronto para analisar seus dados.';

    // Configurar o mock do Gemini para retornar texto
    mockAssistantService.generateFunctionCallResponse.mockResolvedValue({
      type: 'TEXT',
      textResponse: expectedResponse,
    });

    // Act
    const result = await useCase.execute({ prompt });

    // Assert
    expect(result).toBe(expectedResponse);
    expect(mockAssistantService.generateFunctionCallResponse).toHaveBeenCalledTimes(1);
    expect(mockAssistantService.generateFunctionCallResponse).toHaveBeenCalledWith(prompt, []);
  });

  it('deve executar um ciclo de "Function Calling" completo', async () => {
    // Arrange
    const prompt = 'Qual o meu produto mais vendido?';
    
    // --- CICLO 1: IA pede uma função ---
    mockAssistantService.generateFunctionCallResponse.mockResolvedValueOnce({
      type: 'FUNCTION_CALL',
      functionCall: {
        name: 'getTopSellingProducts',
        args: { startDate: '2025-01-01', endDate: '2025-01-31' },
      },
    });

    // --- Configurar o mock do Caso de Uso analítico ---
    const mockFunctionResult = [
      { productId: 1, name: 'Pizza', totalRevenue: 500, totalSold: 50 },
    ];
    mockGetTopProductsUseCase.execute.mockResolvedValue(mockFunctionResult);

    // --- CICLO 2: IA recebe o JSON e dá a resposta final ---
    const finalResponse = 'O seu produto mais vendido é a Pizza, com 50 vendas.';
    mockAssistantService.generateFunctionCallResponse.mockResolvedValueOnce({
      type: 'TEXT',
      textResponse: finalResponse,
    });

    // Act
    const result = await useCase.execute({ prompt });

    // Assert
    expect(result).toBe(finalResponse);

    // Verificar se o Gemini foi chamado 2 vezes
    expect(mockAssistantService.generateFunctionCallResponse).toHaveBeenCalledTimes(2);
    
    // Verificar 1ª chamada (pergunta do user)
    expect(mockAssistantService.generateFunctionCallResponse).toHaveBeenNthCalledWith(1, prompt, []);
    
    // Verificar se o nosso caso de uso analítico foi chamado
    expect(mockGetTopProductsUseCase.execute).toHaveBeenCalledTimes(1);
    
    // --- CORREÇÃO (Bug de Fuso Horário no Teste) ---
    // Recriar as datas "esperadas" da *mesma forma* que a implementação
    // (o AskGeminiAnalyticsUseCase.ts) as cria, forçando o fuso local.
    const expectedInput: IGetTopProductsInput = {
      startDate: new Date('2025-01-01T00:00:00.000'),
      endDate: new Date('2025-01-31T23:59:59.999'),
    };
    expect(mockGetTopProductsUseCase.execute).toHaveBeenCalledWith(expectedInput);
    // --- FIM DA CORREÇÃO ---

    // Verificar 2ª chamada (com o resultado da função no histórico)
    const expectedHistory = [
      { role: 'user' as const, parts: prompt },
      { role: 'model' as const, parts: '[FunctionCall: getTopSellingProducts]' },
      { role: 'user' as const, parts: JSON.stringify(mockFunctionResult) },
    ];

    expect(mockAssistantService.generateFunctionCallResponse).toHaveBeenNthCalledWith(
      2,
      // O prompt da 2ª chamada é a instrução para a IA
      `Com base nestes dados (JSON) que você solicitou: ${JSON.stringify(mockFunctionResult)}. Responda à pergunta original do usuário de forma amigável.`,
      expectedHistory
    );
  });

});

