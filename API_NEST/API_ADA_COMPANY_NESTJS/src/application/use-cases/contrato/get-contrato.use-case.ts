import { Contrato } from '../../../infrastructure/database/entities/contrato.entity';
import { ContratoRepository } from '../../../infrastructure/database/repositories/contrato.repository';

export class GetContratoUseCase {
  constructor(private readonly contratoRepository: ContratoRepository) {}

  async execute(id: string): Promise<Contrato | null> {
    return this.contratoRepository.findById(id);
  }
} 