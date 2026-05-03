import { Inject } from '@nestjs/common';
import { Cliente as ClienteModel } from '../../../domain/models/cliente.model';
import { ClienteRepository } from '../../../domain/repositories/cliente.repository.interface';
import { CLIENTE_REPOSITORY } from '../../../infrastructure/providers/cliente.provider';

export class GetClienteByEmailUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: ClienteRepository
  ) {}

  async execute(email: string): Promise<ClienteModel | null> {
    // Assumindo que o repositório de cliente já tem um método findByEmail
    // Se não tiver, precisaremos adicioná-lo à interface e implementação do repositório.
    return this.clienteRepository.findByEmail(email);
  }
} 