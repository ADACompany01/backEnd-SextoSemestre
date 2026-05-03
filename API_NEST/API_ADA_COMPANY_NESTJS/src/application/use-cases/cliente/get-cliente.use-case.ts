import { Cliente } from '../../../domain/models/cliente.model';
import { ClienteRepository } from '../../../domain/repositories/cliente.repository.interface';
import { Inject } from '@nestjs/common';
import { CLIENTE_REPOSITORY } from '../../../infrastructure/providers/cliente.provider';

export class GetClienteUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: ClienteRepository,
  ) {}

  async execute(id: string): Promise<Cliente | null> {
    return this.clienteRepository.findById(id);
  }
} 