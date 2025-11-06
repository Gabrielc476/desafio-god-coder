import { GetTopProductsUseCase } from '../../../src/application/use-cases/analytics/GetTopProductsUseCase';
import { IGetTopProductsInput } from '../../../src/application/dtos/IGetTopProductsInput';
import { IAnalyticsRepository } from '../../../src/domain/repositories/IAnalyticsRepository';
import { TopProductDTO } from '../../../src/domain/dtos/TopProductDTO';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// --- CORREÇÃO ARQUITETURAL ---
// Mock parcial, mas com tipagem explícita para resolver os erros.
const mockAnalyticsRepository = {
  // CORREÇÃO: Damos ao jest.fn() a assinatura de tipo *completa*
  getTopSellingProducts: jest.fn<(
    startDate: Date, 
    endDate: Date
  ) => Promise<TopProductDTO[]>>(),
  // Note que getRevenueOverTime e getSalesByChannel foram OMITIDOS.
};

describe('GetTopProductsUseCase', () => {
  let useCase: GetTopProductsUseCase;

  beforeEach(() => {
    // Resetar apenas o mock que este teste usa
    mockAnalyticsRepository.getTopSellingProducts.mockReset();
    
    // Instanciar o caso de uso com o repositório mockado
    // Usamos "as any" para permitir a injeção do nosso mock parcial
    useCase = new GetTopProductsUseCase(mockAnalyticsRepository as any);
  });

  it('deve retornar os produtos mais vendidos', async () => {
    // Arrange
    const mockInput: IGetTopProductsInput = {
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31'),
    };
    
    // CORRIGIDO: Corrigido o tipo do productId de string para number
    const mockOutput: TopProductDTO[] = [
      { productId: 1, name: 'Produto A', totalSold: 100, totalRevenue: 1000 },
      { productId: 2, name: 'Produto B', totalSold: 90, totalRevenue: 900 },
    ];
    
    // A tipagem agora funciona sem erros
    mockAnalyticsRepository.getTopSellingProducts.mockResolvedValue(mockOutput);

    // Act
    const result = await useCase.execute(mockInput);

    // Assert
    expect(result).toEqual(mockOutput);
    expect(mockAnalyticsRepository.getTopSellingProducts).toHaveBeenCalledTimes(1);
    expect(mockAnalyticsRepository.getTopSellingProducts).toHaveBeenCalledWith(
      mockInput.startDate,
      mockInput.endDate
    );
  });

  it('deve lançar um erro se a data final for anterior à data inicial', async () => {
    // Arrange
    const mockInput: IGetTopProductsInput = {
      startDate: new Date('2025-01-31'),
      endDate: new Date('2025-01-01'),
    };

    // Act & Assert
    await expect(useCase.execute(mockInput))
      .rejects
      .toThrow('Data final não pode ser anterior à data inicial.');

    // Garantir que o repositório não foi chamado
    expect(mockAnalyticsRepository.getTopSellingProducts).not.toHaveBeenCalled();
  });
});
