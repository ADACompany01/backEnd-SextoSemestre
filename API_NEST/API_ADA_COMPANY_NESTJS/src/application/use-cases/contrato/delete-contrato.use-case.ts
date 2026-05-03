import { ContratoRepository } from '../../../infrastructure/database/repositories/contrato.repository';

export class DeleteContratoUseCase {
  constructor(private readonly contratoRepository: ContratoRepository) {}

  async execute(id: string): Promise<void> {
    await this.contratoRepository.delete(id);
  }
} 