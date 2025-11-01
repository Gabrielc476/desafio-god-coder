import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { GetOverallAverageTicketUseCase } from '../../../src/application/use-cases/analytics/GetOverallAverageTicketUseCase';
import { IGetOverallAverageTicketInput } from '../../../src/application/dtos/IGetOverallAverageTicketInput';
import { IAnalyticsRepository, OverallAverageTicketDTO } from '../../../src/domain/repositories/IAnalyticsRepository';

// 1. Criar um mock tipado APENAS para o método que este caso de uso utiliza
const mockGetOverallAverageTicket = jest.fn<
  (startDate: Date, endDate: Date) => Promise<OverallAverageTicketDTO>
>();

// 2. Criar um mock parcial do repositório
const mockAnalyticsRepository: Partial<IAnalyticsRepository> = {
  getOverallAverageTicket: mockGetOverallAverageTicket,
};

describe('GetOverallAverageTicketUseCase', () => {
  let useCase: GetOverallAverageTicketUseCase;

  beforeEach(() => {
    // Resetar o mock antes de cada teste
    jest.resetAllMocks();
    
    // 3. Instanciar o caso de uso com o mock parcial (usando 'as any')
    useCase = new GetOverallAverageTicketUseCase(mockAnalyticsRepository as IAnalyticsRepository);
  });

  it('deve retornar o ticket médio geral e o total de vendas', async () => {
    // Arrange
    const mockInput: IGetOverallAverageTicketInput = {
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31'),
    };
    
    const mockOutput: OverallAverageTicketDTO = {
      averageTicket: 350.75,
      totalSales: 1500,
    };
    
    // Apontar o mock para o resultado simulado
    mockGetOverallAverageTicket.mockResolvedValue(mockOutput);

    // Act
    const result = await useCase.execute(mockInput);

    // Assert
    expect(result).toEqual(mockOutput);
    expect(mockGetOverallAverageTicket).toHaveBeenCalledTimes(1);
    expect(mockGetOverallAverageTicket).toHaveBeenCalledWith(
      mockInput.startDate,
      mockInput.endDate
    );
  });

  it('deve lançar um erro se a data final for anterior à data inicial', async () => {
    // Arrange
    const mockInput: IGetOverallAverageTicketInput = {
      startDate: new Date('2025-01-31'),
      endDate: new Date('2025-01-01'),
    };

    // Act & Assert
    await expect(useCase.execute(mockInput))
      .rejects
      .toThrow('Data final não pode ser anterior à data inicial.');

    // Garantir que o repositório não foi chamado
    expect(mockGetOverallAverageTicket).not.toHaveBeenCalled();
  });
});
