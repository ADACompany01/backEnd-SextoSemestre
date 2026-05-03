import { Cliente } from '../../../infrastructure/database/entities/cliente.entity';
import { ClienteRepositoryImpl } from '../../../infrastructure/database/repositories/cliente.repository';
import { UpdateClienteDto } from '../../../interfaces/http/dtos/requests/update-cliente.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

export class UpdateClienteUseCase {
  constructor(private readonly clienteRepository: ClienteRepositoryImpl) {}

  async execute(id: string, data: UpdateClienteDto): Promise<Cliente> {
    const cliente = await this.clienteRepository.findById(id);
    if (!cliente) {
      throw new HttpException('Cliente não encontrado', HttpStatus.NOT_FOUND);
    }
    await this.clienteRepository.update(id, data);
    return this.clienteRepository.findById(id);
  }
} 