import { GetSalesByPaymentTypeUseCase } from '../../../src/application/use-cases/analytics/GetSalesByPaymentTypeUseCase';
import { IGetSalesByPaymentTypeInput } from '../../../src/application/dtos/IGetSalesByPaymentTypeInput';
import { IAnalyticsRepository, SalesByPaymentTypeDTO } from '../../../src/domain/repositories/IAnalyticsRepository';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// --- ESTRATÉGIA DE MOCK DESACOPLADA ---
// 1. Criamos um mock parcial, apenas com os métodos que este caso de uso *realmente* precisa.
// 2. Damos ao jest.fn() a assinatura de tipo *completa* para evitar erros de 'never'.
const mockAnalyticsRepository = {
  getSalesByPaymentType: jest.fn<(
    startDate: Date, 
    endDate: Date
  ) => Promise<SalesByPaymentTypeDTO[]>>(),
};

describe('GetSalesByPaymentTypeUseCase', () => {
  let useCase: GetSalesByPaymentTypeUseCase;

  beforeEach(() => {
    // Resetar apenas o mock que este teste usa
    mockAnalyticsRepository.getSalesByPaymentType.mockReset();
    
    // Instanciar o caso de uso com o repositório mockado
    // Usamos "as any" para permitir a injeção do nosso mock parcial
    useCase = new GetSalesByPaymentTypeUseCase(mockAnalyticsRepository as any);
  });

  it('deve retornar as vendas por tipo de pagamento', async () => {
    // Arrange
    const mockInput: IGetSalesByPaymentTypeInput = {
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31'),
    };
    
    const mockOutput: SalesByPaymentTypeDTO[] = [
      { paymentTypeId: 1, paymentTypeName: 'Dinheiro', totalRevenue: 5000, totalTransactions: 50 },
      { paymentTypeId: 2, paymentTypeName: 'Cartão de Crédito', totalRevenue: 10000, totalTransactions: 100 },
    ];
    
    // A tipagem funciona pois o mockResolvedValue espera o Promise<>
    mockAnalyticsRepository.getSalesByPaymentType.mockResolvedValue(mockOutput);

    // Act
    const result = await useCase.execute(mockInput);

    // Assert
    expect(result).toEqual(mockOutput);
    expect(mockAnalyticsRepository.getSalesByPaymentType).toHaveBeenCalledTimes(1);
    expect(mockAnalyticsRepository.getSalesByPaymentType).toHaveBeenCalledWith(
      mockInput.startDate,
      mockInput.endDate
    );
  });

  it('deve lançar um erro se a data final for anterior à data inicial', async () => {
    // Arrange
    const mockInput: IGetSalesByPaymentTypeInput = {
      startDate: new Date('2025-01-31'),
      endDate: new Date('2025-01-01'),
    };

    // Act & Assert
    await expect(useCase.execute(mockInput))
      .rejects
      .toThrow('Data final não pode ser anterior à data inicial.');

    // Garantir que o repositório não foi chamado
    expect(mockAnalyticsRepository.getSalesByPaymentType).not.toHaveBeenCalled();
  });
});
