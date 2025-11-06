import { IDeactivateChannelInput } from '@/application/dtos/channel/IDeactivateChannelInput';
import { Channel } from '@/domain/entities/Channel';
import { IRepository } from '@/domain/repositories/IRepository';

/**
 * Orquestra a lógica de negócio para desativar um canal (soft delete).
 */
export class DeactivateChannelUseCase {
  constructor(private channelRepository: IRepository<Channel>) {}

  /**
   * Executa o caso de uso.
   * @param input Contém o ID do canal a ser desativado.
   */
  async execute(input: IDeactivateChannelInput): Promise<Channel> {
    // 1. Verificar se o canal existe e está ativo
    const channelToDeactivate = await this.channelRepository.findById(input.id);
    if (!channelToDeactivate || !channelToDeactivate.isActive) {
      throw new Error(`Canal com ID ${input.id} não encontrado ou já está inativo.`);
    }

    // 2. Delegar para a camada de persistência para atualizar o status
    const deactivatedChannel = await this.channelRepository.update(input.id, { isActive: false });
    if (!deactivatedChannel) {
      throw new Error(`Falha ao desativar o canal com ID ${input.id}.`);
    }
    return deactivatedChannel;
  }
}