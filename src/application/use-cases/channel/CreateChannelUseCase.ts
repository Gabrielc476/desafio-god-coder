import { ICreateChannelInput } from '@/application/dtos/channel/ICreateChannelInput';
import { Channel } from '@/domain/entities/Channel';
import { IRepository } from '@/domain/repositories/IRepository';

/**
 * Orquestra a lógica de negócio para criar um novo canal.
 */
export class CreateChannelUseCase {
  constructor(private channelRepository: IRepository<Channel>) {}

  /**
   * Executa o caso de uso.
   * @param input Contém o nome do canal a ser criado.
   */
  async execute(input: ICreateChannelInput): Promise<Channel> {
    // 1. Validação de entrada
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('O nome do canal é obrigatório.');
    }

    // 2. Validação da regra de negócio: não permitir nomes duplicados
    const existingChannels = await this.channelRepository.find({ name: input.name });
    if (existingChannels.length > 0) {
      throw new Error(`Um canal com o nome "${input.name}" já existe.`);
    }

    // 3. Delegação para a camada de persistência
    return this.channelRepository.create({ name: input.name, isActive: true });
  }
}