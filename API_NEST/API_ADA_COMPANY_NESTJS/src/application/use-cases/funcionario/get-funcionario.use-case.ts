import { Funcionario } from '../../../infrastructure/database/entities/funcionario.entity';
import { FuncionarioRepositoryImpl } from '../../../infrastructure/database/repositories/funcionario.repository';

export class GetFuncionarioUseCase {
  constructor(private readonly funcionarioRepository: FuncionarioRepositoryImpl) {}

  async execute(id: string): Promise<Funcionario | null> {
    return this.funcionarioRepository.findById(id);
  }
} 