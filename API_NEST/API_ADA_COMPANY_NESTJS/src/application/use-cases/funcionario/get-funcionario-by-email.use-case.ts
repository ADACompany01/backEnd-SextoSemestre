import { Inject } from '@nestjs/common';
import { Funcionario as FuncionarioModel } from '../../../domain/models/funcionario.model';
import { FuncionarioRepository } from '../../../domain/repositories/funcionario.repository.interface';
import { FUNCIONARIO_REPOSITORY } from '../../../infrastructure/providers/funcionario.provider';

export class GetFuncionarioByEmailUseCase {
  constructor(
    @Inject(FUNCIONARIO_REPOSITORY)
    private readonly funcionarioRepository: FuncionarioRepository
  ) {}

  async execute(email: string): Promise<FuncionarioModel | null> {
    return this.funcionarioRepository.findByEmail(email);
  }
} 