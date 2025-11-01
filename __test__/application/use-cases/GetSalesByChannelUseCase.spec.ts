import { GetSalesByChannelUseCase } from '../../../src/application/use-cases/analytics/GetSalesByChannelUseCase';
import { IGetSalesByChannelInput } from '../../../src/application/dtos/IGetSalesByChannelInput';
import { IAnalyticsRepository, SalesByChannelDTO } from '../../../src/domain/repositories/IAnalyticsRepository';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock parcial, mas com tipagem explícita para resolver os erros.
const mockAnalyticsRepository = {
  getSalesByChannel: jest.fn<(
    startDate: Date, 
    endDate: Date
  ) => Promise<SalesByChannelDTO[]>>(),
};

describe('GetSalesByChannelUseCase', () => {
  let useCase: GetSalesByChannelUseCase;

  beforeEach(() => {
    // Resetar apenas o mock que este teste usa
    mockAnalyticsRepository.getSalesByChannel.mockReset();
    
    // Instanciar o caso de uso com o repositório mockado
    useCase = new GetSalesByChannelUseCase(mockAnalyticsRepository as any);
  });

  it('deve retornar as vendas por canal', async () => {
    // Arrange
    const mockInput: IGetSalesByChannelInput = {
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31'),
    };
    
    // --- CORREÇÃO (TS2353) ---
    // A propriedade é 'channelName', e não 'name'.
    const mockOutput: SalesByChannelDTO[] = [
      { channelId: 1, channelName: 'iFood', totalSales: 50, totalRevenue: 5000 },
      { channelId: 2, channelName: 'Salão', totalSales: 100, totalRevenue: 10000 },
    ];
    
    mockAnalyticsRepository.getSalesByChannel.mockResolvedValue(mockOutput);

    // Act
    const result = await useCase.execute(mockInput);

    // Assert
    expect(result).toEqual(mockOutput);
    expect(mockAnalyticsRepository.getSalesByChannel).toHaveBeenCalledTimes(1);
    expect(mockAnalyticsRepository.getSalesByChannel).toHaveBeenCalledWith(
      mockInput.startDate,
      mockInput.endDate
    );
  });

  it('deve lançar um erro se a data final for anterior à data inicial', async () => {
    // Arrange
    const mockInput: IGetSalesByChannelInput = {
      startDate: new Date('2025-01-31'),
      endDate: new Date('2025-01-01'),
    };

    // Act & Assert
    await expect(useCase.execute(mockInput))
      .rejects
      .toThrow('Data final não pode ser anterior à data inicial.');

    // Garantir que o repositório não foi chamado
    expect(mockAnalyticsRepository.getSalesByChannel).not.toHaveBeenCalled();
  });
});

