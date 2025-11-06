import { IFindChannelInput } from '@/application/dtos/channel/IFindChannelInput';
import { Channel } from '@/domain/entities/Channel';
import { IRepository } from '@/domain/repositories/IRepository';

/**
 * Orquestra a lógica de negócio para encontrar um canal por ID.
 */
export class FindChannelUseCase {
  constructor(private channelRepository: IRepository<Channel>) {}

  /**
   * Executa o caso de uso.
   * @param input Contém o ID do canal a ser encontrado.
   */
  async execute(input: IFindChannelInput): Promise<Channel | null> {
    // 1. Delegação para a camada de persistência
    const channel = await this.channelRepository.findById(input.id);

    // 2. Regra de negócio: o caso de uso pode retornar nulo se não encontrado.
    // Adicionalmente, se o canal for encontrado mas estiver inativo, trate-o como não encontrado.
    if (channel && !channel.isActive) {
      return null;
    }

    // O controller na camada de infraestrutura será responsável por traduzir isso para um status HTTP 404.
    return channel;
  }
}