import { IFindAllChannelsInput } from '@/application/dtos/channel/IFindAllChannelsInput';
import { Channel } from '@/domain/entities/Channel';
import { IRepository } from '@/domain/repositories/IRepository';

/**
 * Orquestra a lógica de negócio para buscar todos os canais.
 */
export class FindAllChannelsUseCase {
  constructor(private channelRepository: IRepository<Channel>) {}

  /**
   * Executa o caso de uso.
   * @param input Pode conter filtros futuros como paginação.
   */
  async execute(input: IFindAllChannelsInput): Promise<Channel[]> {
    // Retorna apenas os canais que estão ativos.
    return this.channelRepository.find({ isActive: true });
  }
}