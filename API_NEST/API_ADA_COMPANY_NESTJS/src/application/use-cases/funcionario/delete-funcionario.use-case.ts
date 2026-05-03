import { FuncionarioRepositoryImpl } from '../../../infrastructure/database/repositories/funcionario.repository';

export class DeleteFuncionarioUseCase {
  constructor(private readonly funcionarioRepository: FuncionarioRepositoryImpl) {}

  async execute(id: string): Promise<void> {
    await this.funcionarioRepository.delete(id);
  }
} 