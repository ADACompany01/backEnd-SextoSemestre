import { Orcamento as OrcamentoModel } from '../../../domain/models/orcamento.model';
import { OrcamentoRepositoryInterface } from '../../../domain/repositories/orcamento.repository.interface';
import { UpdateOrcamentoDto } from '../../../interfaces/http/dtos/requests/update-orcamento.dto';

export class UpdateOrcamentoUseCase {
  constructor(private readonly orcamentoRepository: OrcamentoRepositoryInterface) {}

  async execute(id: string, data: Partial<UpdateOrcamentoDto>): Promise<[number, OrcamentoModel[]]> {
    return this.orcamentoRepository.update(id, data);
  }
} 