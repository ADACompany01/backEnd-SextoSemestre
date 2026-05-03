import { Injectable } from '@nestjs/common';
import { Solicitacao as SolicitacaoModel } from '../../../domain/models/solicitacao.model';
import { SolicitacaoRepository } from '../../../domain/repositories/solicitacao.repository.interface';

@Injectable()
export class ListSolicitacoesUseCase {
  constructor(
    private readonly solicitacaoRepository: SolicitacaoRepository,
  ) {}

  async execute(): Promise<SolicitacaoModel[]> {
    return this.solicitacaoRepository.findAll();
  }
}

