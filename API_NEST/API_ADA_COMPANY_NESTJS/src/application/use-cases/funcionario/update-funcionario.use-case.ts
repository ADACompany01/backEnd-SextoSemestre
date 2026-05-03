import { Funcionario } from '../../../infrastructure/database/entities/funcionario.entity';
import { FuncionarioRepositoryImpl } from '../../../infrastructure/database/repositories/funcionario.repository';
import { UpdateFuncionarioDto } from '../../../interfaces/http/dtos/requests/update-funcionario.dto';

export class UpdateFuncionarioUseCase {
  constructor(private readonly funcionarioRepository: FuncionarioRepositoryImpl) {}

  async execute(id: string, data: UpdateFuncionarioDto): Promise<Funcionario> {
    await this.funcionarioRepository.update(id, data);
    return this.funcionarioRepository.findById(id);
  }
} 