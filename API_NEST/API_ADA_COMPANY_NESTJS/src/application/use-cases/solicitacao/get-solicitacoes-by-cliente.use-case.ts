import { Injectable } from '@nestjs/common';
import { Solicitacao as SolicitacaoModel } from '../../../domain/models/solicitacao.model';
import { SolicitacaoRepository } from '../../../domain/repositories/solicitacao.repository.interface';

@Injectable()
export class GetSolicitacoesByClienteUseCase {
  constructor(
    private readonly solicitacaoRepository: SolicitacaoRepository,
  ) {}

  async execute(id_cliente: string): Promise<SolicitacaoModel[]> {
    return this.solicitacaoRepository.findByCliente(id_cliente);
  }
}

