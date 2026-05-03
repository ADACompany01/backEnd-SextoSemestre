import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { SolicitacaoRepository } from '../../../domain/repositories/solicitacao.repository.interface';
import { SOLICITACAO_REPOSITORY } from '../../../infrastructure/providers/solicitacao.provider';
import { CreatePacoteUseCase } from '../pacote/create-pacote.use-case';
import { CreateOrcamentoUseCase } from '../orcamento/create-orcamento.use-case';
import { Orcamento as OrcamentoModel } from '../../../domain/models/orcamento.model';
import { PacoteRepository } from '../../../domain/repositories/pacote.repository.interface';
import { PACOTE_REPOSITORY } from '../../../infrastructure/providers/pacote.provider';
import { TipoPacote } from '../../../interfaces/http/dtos/requests/create-pacote.dto';

@Injectable()
export class CreateOrcamentoFromSolicitacaoUseCase {
  // Valores base para cada tipo de pacote
  private readonly VALORES_BASE = {
    A: 1000.00,
    AA: 1500.00,
    AAA: 2000.00,
  };

  constructor(
    @Inject(SOLICITACAO_REPOSITORY)
    private readonly solicitacaoRepository: SolicitacaoRepository,
    private readonly createPacoteUseCase: CreatePacoteUseCase,
    private readonly createOrcamentoUseCase: CreateOrcamentoUseCase,
    @Inject(PACOTE_REPOSITORY)
    private readonly pacoteRepository: PacoteRepository,
  ) {}

  async execute(id_solicitacao: string, valor_orcamento?: number): Promise<OrcamentoModel> {
    // Buscar a solicitação
    const solicitacao = await this.solicitacaoRepository.findById(id_solicitacao);
    if (!solicitacao) {
      throw new NotFoundException(`Solicitação com ID ${id_solicitacao} não encontrada`);
    }

    // Verificar se já existe um orçamento para esta solicitação
    if (solicitacao.cod_orcamento) {
      throw new ConflictException('Já existe um orçamento para esta solicitação');
    }

    // Verificar se já existe um pacote para esta solicitação
    let id_pacote = solicitacao.id_pacote;

    // Se não existir pacote, criar um novo
    if (!id_pacote) {
      // Calcular valor base do pacote
      const valor_base = this.VALORES_BASE[solicitacao.tipo_pacote] || this.VALORES_BASE.AA;

      // Criar pacote
      const pacote = await this.createPacoteUseCase.execute({
        id_cliente: solicitacao.id_cliente,
        tipo_pacote: solicitacao.tipo_pacote as TipoPacote,
        valor_base,
      });

      id_pacote = pacote.id_pacote;

      // Atualizar solicitação com o id_pacote
      await this.solicitacaoRepository.update(id_solicitacao, {
        id_pacote,
      });
    }

    // Calcular valor do orçamento (usar o valor fornecido ou calcular baseado no pacote)
    let valorOrcamento = valor_orcamento;
    if (!valorOrcamento) {
      // Se já existe pacote, buscar o valor_base dele
      if (id_pacote) {
        const pacote = await this.pacoteRepository.findById(id_pacote);
        if (pacote) {
          valorOrcamento = Number(pacote.valor_base);
        } else {
          valorOrcamento = this.VALORES_BASE[solicitacao.tipo_pacote] || this.VALORES_BASE.AA;
        }
      } else {
        valorOrcamento = this.VALORES_BASE[solicitacao.tipo_pacote] || this.VALORES_BASE.AA;
      }
    }

    // Criar orçamento
    const dataAtual = new Date();
    const dataValidade = new Date();
    dataValidade.setDate(dataValidade.getDate() + 30);

    const orcamento = await this.createOrcamentoUseCase.execute({
      id_pacote,
      valor_orcamento: valorOrcamento,
      data_orcamento: dataAtual,
      data_validade: dataValidade,
    });

    // Atualizar solicitação com o cod_orcamento e status
    await this.solicitacaoRepository.update(id_solicitacao, {
      cod_orcamento: orcamento.cod_orcamento,
      status: 'ORCAMENTO_CRIADO',
    });

    return orcamento;
  }
}

