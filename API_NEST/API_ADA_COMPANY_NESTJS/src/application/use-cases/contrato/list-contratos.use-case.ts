import { Contrato } from '../../../infrastructure/database/entities/contrato.entity';
import { ContratoRepository } from '../../../infrastructure/database/repositories/contrato.repository';

export class ListContratosUseCase {
  constructor(private readonly contratoRepository: ContratoRepository) {}

  async execute(): Promise<Contrato[]> {
    return this.contratoRepository.findAll();
  }
} 