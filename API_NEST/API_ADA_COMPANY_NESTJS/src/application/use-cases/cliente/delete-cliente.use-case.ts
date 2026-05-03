import { HttpException, HttpStatus } from '@nestjs/common';

export class DeleteClienteUseCase {
  constructor(private readonly clienteRepository: any) {}

  async execute(id: string): Promise<void> {
    const cliente = await this.clienteRepository.findById(id);
    if (!cliente) {
      throw new HttpException('Cliente não encontrado', HttpStatus.NOT_FOUND);
    }
    await this.clienteRepository.delete(id);
  }
} 