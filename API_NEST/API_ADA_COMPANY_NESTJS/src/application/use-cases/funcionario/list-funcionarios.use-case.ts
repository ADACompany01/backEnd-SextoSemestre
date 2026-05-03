import { Funcionario } from '../../../infrastructure/database/entities/funcionario.entity';
import { FuncionarioRepositoryImpl } from '../../../infrastructure/database/repositories/funcionario.repository';

export class ListFuncionariosUseCase {
  constructor(private readonly funcionarioRepository: FuncionarioRepositoryImpl) {}

  async execute(): Promise<Funcionario[]> {
    return this.funcionarioRepository.findAll();
  }
} 