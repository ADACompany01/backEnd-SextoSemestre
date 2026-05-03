import { Orcamento as OrcamentoModel } from '../../../domain/models/orcamento.model';
import { OrcamentoRepository } from '../../../infrastructure/database/repositories/orcamento.repository';

export class GetOrcamentoUseCase {
  constructor(private readonly orcamentoRepository: OrcamentoRepository) {}

  async execute(id: string): Promise<OrcamentoModel | null> {
    return this.orcamentoRepository.findById(id);
  }
} 