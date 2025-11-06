import { IUpdateChannelInput } from '@/application/dtos/channel/IUpdateChannelInput';
import { Channel } from '@/domain/entities/Channel';
import { IRepository } from '@/domain/repositories/IRepository';

/**
 * Orquestra a lógica de negócio para atualizar um canal existente.
 */
export class UpdateChannelUseCase {
  constructor(private channelRepository: IRepository<Channel>) {}

  /**
   * Executa o caso de uso.
   * @param input Contém o ID e os dados a serem atualizados.
   */
  async execute(input: IUpdateChannelInput): Promise<Channel> {
    const { id, name } = input;

    // 1. Validação da regra de negócio: verificar se o canal existe
    const channelToUpdate = await this.channelRepository.findById(id);
    if (!channelToUpdate) {
      throw new Error(`Canal com ID ${id} não encontrado.`);
    }

    // 2. Validação da regra de negócio: se um nome foi fornecido, verificar se já não está em uso por outro canal
    if (name && name !== channelToUpdate.name) {
      const existingChannels = await this.channelRepository.find({ name });
      if (existingChannels.length > 0 && existingChannels[0].id !== id) {
        throw new Error(`Um canal com o nome "${name}" já existe.`);
      }
    }

    // 3. Delegação para a camada de persistência
    const updatedChannel = await this.channelRepository.update(id, { name });
    if (!updatedChannel) {
      throw new Error(`Falha ao atualizar o canal com ID ${id}.`);
    }
    return updatedChannel;
  }
}