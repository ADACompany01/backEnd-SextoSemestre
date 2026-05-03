import { Orcamento as OrcamentoModel } from '../../../domain/models/orcamento.model';
import { OrcamentoRepository } from '../../../infrastructure/database/repositories/orcamento.repository';

export class ListOrcamentosUseCase {
  constructor(private readonly orcamentoRepository: OrcamentoRepository) {}

  async execute(): Promise<OrcamentoModel[]> {
    return this.orcamentoRepository.findAll();
  }
} 