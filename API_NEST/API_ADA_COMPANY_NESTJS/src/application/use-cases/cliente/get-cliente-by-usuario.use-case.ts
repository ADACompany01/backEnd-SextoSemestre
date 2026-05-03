import { Cliente } from '../../../domain/models/cliente.model';
import { ClienteRepository } from '../../../domain/repositories/cliente.repository.interface';
import { Inject } from '@nestjs/common';
import { CLIENTE_REPOSITORY } from '../../../infrastructure/providers/cliente.provider';

export class GetClienteByUsuarioUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: ClienteRepository,
  ) {}

  async execute(id_usuario: string): Promise<Cliente | null> {
    return this.clienteRepository.findByIdUsuario(id_usuario);
  }
}

