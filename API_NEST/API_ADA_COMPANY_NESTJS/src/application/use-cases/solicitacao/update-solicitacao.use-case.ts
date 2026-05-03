import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { SolicitacaoRepository } from '../../../domain/repositories/solicitacao.repository.interface';
import { SOLICITACAO_REPOSITORY } from '../../../infrastructure/providers/solicitacao.provider';
import { Solicitacao as SolicitacaoModel } from '../../../domain/models/solicitacao.model';
import { UpdateSolicitacaoDto } from '../../../interfaces/http/dtos/requests/update-solicitacao.dto';

@Injectable()
export class UpdateSolicitacaoUseCase {
  constructor(
    @Inject(SOLICITACAO_REPOSITORY)
    private readonly solicitacaoRepository: SolicitacaoRepository,
  ) {}

  async execute(id: string, updateData: UpdateSolicitacaoDto): Promise<SolicitacaoModel> {
    // Verificar se a solicitação existe
    const solicitacao = await this.solicitacaoRepository.findById(id);
    if (!solicitacao) {
      throw new NotFoundException(`Solicitação com ID ${id} não encontrada`);
    }

    // Atualizar a solicitação
    const [affectedCount, affectedRows] = await this.solicitacaoRepository.update(id, updateData);

    if (affectedCount === 0) {
      throw new NotFoundException(`Solicitação com ID ${id} não encontrada para atualização`);
    }

    // Retornar a solicitação atualizada
    return affectedRows[0];
  }
}

