import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Solicitacao as SolicitacaoModel } from '../../../domain/models/solicitacao.model';
import { SolicitacaoRepository } from '../../../domain/repositories/solicitacao.repository.interface';
import { CreateSolicitacaoDto } from '../../../interfaces/http/dtos/requests/create-solicitacao.dto';
import { ClienteRepository } from '../../../domain/repositories/cliente.repository.interface';
import { CLIENTE_REPOSITORY } from '../../../infrastructure/providers/cliente.provider';

@Injectable()
export class CreateSolicitacaoUseCase {
  constructor(
    private readonly solicitacaoRepository: SolicitacaoRepository,
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: ClienteRepository,
  ) {}

  async execute(id_cliente: string, data: CreateSolicitacaoDto): Promise<SolicitacaoModel> {
    // Verificar se o cliente existe
    const cliente = await this.clienteRepository.findById(id_cliente);
    if (!cliente) {
      throw new NotFoundException(`Cliente com ID ${id_cliente} não encontrado`);
    }

    return this.solicitacaoRepository.create({
      id_cliente,
      site: data.site,
      tipo_pacote: data.tipo_pacote,
      observacoes: data.observacoes,
      selected_issues: data.selected_issues,
      status: 'PENDENTE',
    });
  }
}

