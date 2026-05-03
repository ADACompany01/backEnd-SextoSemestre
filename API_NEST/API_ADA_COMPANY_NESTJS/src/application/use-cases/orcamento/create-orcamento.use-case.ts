import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { Orcamento as OrcamentoModel } from '../../../domain/models/orcamento.model';
import { OrcamentoRepository } from '../../../infrastructure/database/repositories/orcamento.repository';
import { CreateOrcamentoDto } from '../../../interfaces/http/dtos/requests/create-orcamento.dto';
import { PACOTE_REPOSITORY } from '../../../infrastructure/providers/pacote.provider';
import { PacoteRepository } from '../../../domain/repositories/pacote.repository.interface';

@Injectable()
export class CreateOrcamentoUseCase {
  constructor(
    private readonly orcamentoRepository: OrcamentoRepository,
    @Inject(PACOTE_REPOSITORY)
    private readonly pacoteRepository: PacoteRepository,
  ) {}

  async execute(data: CreateOrcamentoDto): Promise<OrcamentoModel> {
    // Verificar se já existe um orçamento para este pacote
    const existingOrcamento = await this.orcamentoRepository.findByPacote(data.id_pacote);
    if (existingOrcamento) {
      throw new ConflictException(`Já existe um orçamento para este pacote`);
    }

    // Verificar se o pacote existe
    const pacote = await this.pacoteRepository.findById(data.id_pacote);
    if (!pacote) {
      throw new NotFoundException(`Pacote com ID ${data.id_pacote} não encontrado`);
    }

    const dataAtual = new Date();
    const dataValidade = new Date();
    dataValidade.setDate(dataValidade.getDate() + 30);

    return this.orcamentoRepository.create({
      ...data,
      data_orcamento: dataAtual,
      data_validade: dataValidade,
    });
  }
} 