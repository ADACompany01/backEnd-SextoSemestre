import { Cliente } from '../../../domain/models/cliente.model';
import { ClienteRepository } from '../../../domain/repositories/cliente.repository.interface';
import { Inject } from '@nestjs/common';
import { CLIENTE_REPOSITORY } from '../../../infrastructure/providers/cliente.provider';

export class ListClientesUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: ClienteRepository,
  ) {}

  async execute(): Promise<Cliente[]> {
    return this.clienteRepository.findAll();
  }
} 