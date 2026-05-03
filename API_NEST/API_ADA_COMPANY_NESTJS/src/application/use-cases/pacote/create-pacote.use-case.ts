import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Pacote as PacoteModel } from '../../../domain/models/pacote.model';
import { PacoteRepositoryImpl } from '../../../infrastructure/database/repositories/pacote.repository';
import { CreatePacoteDto } from '../../../interfaces/http/dtos/requests/create-pacote.dto';
import { ClienteRepository } from '../../../domain/repositories/cliente.repository.interface';
import { CLIENTE_REPOSITORY } from '../../../infrastructure/providers/cliente.provider';

@Injectable()
export class CreatePacoteUseCase {
  constructor(
    private readonly pacoteRepository: PacoteRepositoryImpl,
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: ClienteRepository,
  ) {}

  async execute(data: CreatePacoteDto): Promise<PacoteModel> {
    const cliente = await this.clienteRepository.findById(data.id_cliente);
    if (!cliente) {
      throw new NotFoundException(`Cliente com ID ${data.id_cliente} não encontrado`);
    }
    return this.pacoteRepository.create(data);
  }
} 