import { GetSalesHeatmapUseCase } from '../../../src/application/use-cases/analytics/GetSalesHeatmapUseCase';
import { IGetSalesHeatmapInput } from '../../../src/application/dtos/IGetSalesHeatmapInput';
import { IAnalyticsRepository, SalesHeatmapDTO } from '../../../src/domain/repositories/IAnalyticsRepository';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// --- Mocking Desacoplado ---
// 1. Criamos um mock parcial apenas com os métodos que este caso de uso precisa.
const mockAnalyticsRepository = {
  // 2. Damos ao jest.fn() a sua assinatura de tipo explícita e completa.
  getSalesHeatmap: jest.fn<(
    startDate: Date,
    endDate: Date
  ) => Promise<SalesHeatmapDTO[]>>(),
};

describe('GetSalesHeatmapUseCase', () => {
  let useCase: GetSalesHeatmapUseCase;

  beforeEach(() => {
    // Resetar o mock antes de cada teste
    mockAnalyticsRepository.getSalesHeatmap.mockReset();
    
    // 3. Injetamos o mock parcial usando "as any"
    useCase = new GetSalesHeatmapUseCase(mockAnalyticsRepository as any);
  });

  it('deve retornar os dados do heatmap de vendas', async () => {
    // Arrange
    const mockInput: IGetSalesHeatmapInput = {
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31'),
    };
    
    const mockOutput: SalesHeatmapDTO[] = [
      { hour: 10, channelId: 1, channelName: 'iFood', totalSales: 5, totalRevenue: 500 },
      { hour: 10, channelId: 2, channelName: 'Salão', totalSales: 2, totalRevenue: 200 },
      { hour: 11, channelId: 1, channelName: 'iFood', totalSales: 8, totalRevenue: 800 },
    ];
    
    // A tipagem agora funciona
    mockAnalyticsRepository.getSalesHeatmap.mockResolvedValue(mockOutput);

    // Act
    const result = await useCase.execute(mockInput);

    // Assert
    expect(result).toEqual(mockOutput);
    expect(mockAnalyticsRepository.getSalesHeatmap).toHaveBeenCalledTimes(1);
    expect(mockAnalyticsRepository.getSalesHeatmap).toHaveBeenCalledWith(
      mockInput.startDate,
      mockInput.endDate
    );
  });

  it('deve lançar um erro se a data final for anterior à data inicial', async () => {
    // Arrange
    const mockInput: IGetSalesHeatmapInput = {
      startDate: new Date('2025-01-31'),
      endDate: new Date('2025-01-01'),
    };

    // Act & Assert
    await expect(useCase.execute(mockInput))
      .rejects
      .toThrow('Data final não pode ser anterior à data inicial.');

    // Garantir que o repositório não foi chamado
    expect(mockAnalyticsRepository.getSalesHeatmap).not.toHaveBeenCalled();
  });
});
