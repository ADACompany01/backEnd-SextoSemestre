import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Contrato as ContratoModel } from '../../../domain/models/contrato.model';
import { ContratoRepository } from '../../../infrastructure/database/repositories/contrato.repository';
import { UpdateContratoDto } from '../../../interfaces/http/dtos/requests/update-contrato.dto';
import { ORCAMENTO_REPOSITORY } from '../../../infrastructure/providers/orcamento.provider';
import { OrcamentoRepository } from '../../../infrastructure/database/repositories/orcamento.repository';

@Injectable()
export class UpdateContratoUseCase {
  constructor(
    private readonly contratoRepository: ContratoRepository,
    @Inject(ORCAMENTO_REPOSITORY)
    private readonly orcamentoRepository: OrcamentoRepository,
  ) {}

  async execute(id: string, data: UpdateContratoDto): Promise<ContratoModel> {
    const contrato = await this.contratoRepository.findById(id);
    if (!contrato) {
      throw new NotFoundException(`Contrato com ID ${id} não encontrado`);
    }

    const updateData: Partial<ContratoModel> = { ...data };

    // Se o código do orçamento for alterado, buscar o novo orçamento para obter o id_cliente
    if (data.cod_orcamento && data.cod_orcamento !== contrato.cod_orcamento) {
      const orcamento = await this.orcamentoRepository.findById(data.cod_orcamento);
      if (!orcamento) {
        throw new NotFoundException(`Orçamento com código ${data.cod_orcamento} não encontrado`);
      }
      // Obter o id_cliente do orçamento através do pacote (usando type assertion temporariamente)
      (updateData as any).id_cliente = (orcamento as any).pacote.id_cliente;
    }

    // Converter strings de data para objetos Date se estiverem presentes
    if (data.data_inicio) {
      updateData.data_inicio = new Date(data.data_inicio);
    }
    if (data.data_entrega) {
      updateData.data_entrega = new Date(data.data_entrega);
    }

    const [affectedCount] = await this.contratoRepository.update(id, updateData);

    if (affectedCount === 0) {
         throw new NotFoundException(`Contrato com ID ${id} não encontrado para atualização`);
    }

    // Retornar o contrato atualizado
    return this.contratoRepository.findById(id);
  }
} 