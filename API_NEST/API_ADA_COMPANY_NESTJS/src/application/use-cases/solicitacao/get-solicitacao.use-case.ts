import { Injectable } from '@nestjs/common';
import { Solicitacao as SolicitacaoModel } from '../../../domain/models/solicitacao.model';
import { SolicitacaoRepository } from '../../../domain/repositories/solicitacao.repository.interface';

@Injectable()
export class GetSolicitacaoUseCase {
  constructor(
    private readonly solicitacaoRepository: SolicitacaoRepository,
  ) {}

  async execute(id: string): Promise<SolicitacaoModel | null> {
    return this.solicitacaoRepository.findById(id);
  }
}

