import { GetRevenueOverTimeUseCase } from '../../../src/application/use-cases/analytics/GetRevenueOverTimeUseCase';
import { IGetRevenueOverTimeInput } from '../../../src/application/dtos/IGetRevenueOverTimeInput';
import { IAnalyticsRepository, RevenueOverTimeDTO, Granularity } from '../../../src/domain/repositories/IAnalyticsRepository';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// --- CORREÇÃO ARQUITETURAL ---
// Mock parcial, mas com tipagem explícita para resolver os erros.
const mockAnalyticsRepository = {
  // CORREÇÃO: Damos ao jest.fn() a assinatura de tipo *completa*
  // da função que ele está a mockar.
  getRevenueOverTime: jest.fn<(
    startDate: Date, 
    endDate: Date, 
    granularity: Granularity
  ) => Promise<RevenueOverTimeDTO[]>>(),
  // Note que getTopSellingProducts e getSalesByChannel foram OMITIDOS.
};

describe('GetRevenueOverTimeUseCase', () => {
  let useCase: GetRevenueOverTimeUseCase;

  beforeEach(() => {
    // Resetar apenas o mock que este teste usa
    mockAnalyticsRepository.getRevenueOverTime.mockReset();
    
    // Instanciar o caso de uso com o repositório mockado
    // Usamos "as any" para permitir a injeção do nosso mock parcial
    // onde a interface completa é esperada.
    useCase = new GetRevenueOverTimeUseCase(mockAnalyticsRepository as any);
  });

  it('deve retornar o faturamento ao longo do tempo', async () => {
    // Arrange
    const mockInput: IGetRevenueOverTimeInput = {
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31'),
      granularity: 'day',
    };
    
    const mockOutput: RevenueOverTimeDTO[] = [
      { date: new Date('2025-01-01'), totalRevenue: 1000 },
      { date: new Date('2025-01-02'), totalRevenue: 1200 },
    ];
    
    // Agora que jest.fn() está tipado, o mockResolvedValue
    // sabe que espera um RevenueOverTimeDTO[] e o erro desaparece.
    mockAnalyticsRepository.getRevenueOverTime.mockResolvedValue(mockOutput);

    // Act
    const result = await useCase.execute(mockInput);

    // Assert
    expect(result).toEqual(mockOutput);
    expect(mockAnalyticsRepository.getRevenueOverTime).toHaveBeenCalledTimes(1);
    expect(mockAnalyticsRepository.getRevenueOverTime).toHaveBeenCalledWith(
      mockInput.startDate,
      mockInput.endDate,
      'day' // Garantir que a granularidade foi passada
    );
  });

  it('deve usar "day" como granularidade padrão se nenhuma for fornecida', async () => {
    // Arrange
    const mockInput = {
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31'),
      // Sem 'granularity'
    } as IGetRevenueOverTimeInput; 
    
    // A tipagem também funciona para um array vazio
    mockAnalyticsRepository.getRevenueOverTime.mockResolvedValue([]); // O retorno não importa

    // Act
    await useCase.execute(mockInput);

    // Assert
    expect(mockAnalyticsRepository.getRevenueOverTime).toHaveBeenCalledWith(
      mockInput.startDate,
      mockInput.endDate,
      'day' // O padrão deve ser 'day'
    );
  });

  it('deve lançar um erro se a data final for anterior à data inicial', async () => {
    // Arrange
    const mockInput: IGetRevenueOverTimeInput = {
      startDate: new Date('2025-01-31'),
      endDate: new Date('2025-01-01'),
      granularity: 'day',
    };

    // Act & Assert
    await expect(useCase.execute(mockInput))
      .rejects
      .toThrow('Data final não pode ser anterior à data inicial.');

    // Garantir que o repositório não foi chamado
    expect(mockAnalyticsRepository.getRevenueOverTime).not.toHaveBeenCalled();
  });
});

