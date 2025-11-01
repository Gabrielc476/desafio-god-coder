import { GetCustomerRFMUseCase } from '../../../src/application/use-cases/analytics/GetCustomerRFMUseCase';
import { IGetCustomerRFMInput } from '../../../src/application/dtos/IGetCustomerRFMInput';
import { IAnalyticsRepository, CustomerRFMDTO } from '../../../src/domain/repositories/IAnalyticsRepository';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// --- Mock Parcial ---
// Criamos um mock apenas com os métodos que este caso de uso precisa.
const mockAnalyticsRepository = {
  // Damos ao jest.fn() a assinatura de tipo *completa*
  getCustomerRFM: jest.fn<(
    startDate: Date, 
    endDate: Date
  ) => Promise<CustomerRFMDTO[]>>(),
};

describe('GetCustomerRFMUseCase', () => {
  let useCase: GetCustomerRFMUseCase;

  beforeEach(() => {
    // Resetar o mock antes de cada teste
    mockAnalyticsRepository.getCustomerRFM.mockReset();
    
    // Instanciar o caso de uso com o repositório mockado
    useCase = new GetCustomerRFMUseCase(mockAnalyticsRepository as any);
  });

  it('deve retornar os dados RFM dos clientes', async () => {
    // Arrange
    const mockInput: IGetCustomerRFMInput = {
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31'),
    };
    
    const mockOutput: CustomerRFMDTO[] = [
      { 
        customerId: 1, 
        customerName: 'Cliente Fiel', 
        lastPurchaseDate: new Date('2025-01-30'),
        frequency: 10,
        monetaryValue: 2500
      },
    ];
    
    // Configurar o mock (agora tipado corretamente)
    mockAnalyticsRepository.getCustomerRFM.mockResolvedValue(mockOutput);

    // Act
    const result = await useCase.execute(mockInput);

    // Assert
    expect(result).toEqual(mockOutput);
    expect(mockAnalyticsRepository.getCustomerRFM).toHaveBeenCalledTimes(1);
    expect(mockAnalyticsRepository.getCustomerRFM).toHaveBeenCalledWith(
      mockInput.startDate,
      mockInput.endDate
    );
  });

  it('deve lançar um erro se a data final for anterior à data inicial', async () => {
    // Arrange
    const mockInput: IGetCustomerRFMInput = {
      startDate: new Date('2025-01-31'),
      endDate: new Date('2025-01-01'),
    };

    // Act & Assert
    await expect(useCase.execute(mockInput))
      .rejects
      .toThrow('Data final não pode ser anterior à data inicial.');

    // Garantir que o repositório não foi chamado
    expect(mockAnalyticsRepository.getCustomerRFM).not.toHaveBeenCalled();
  });
});
