import { OrcamentoRepository } from '../../../infrastructure/database/repositories/orcamento.repository';

export class DeleteOrcamentoUseCase {
  constructor(private readonly orcamentoRepository: OrcamentoRepository) {}

  async execute(id: string): Promise<void> {
    await this.orcamentoRepository.delete(id);
  }
} 