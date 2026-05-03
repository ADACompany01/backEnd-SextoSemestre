import { Funcionario as FuncionarioModel } from '../../../domain/models/funcionario.model';
import { FuncionarioRepositoryImpl } from '../../../infrastructure/database/repositories/funcionario.repository';
import { CreateFuncionarioDto } from '../../../interfaces/http/dtos/requests/create-funcionario.dto';
import * as bcrypt from 'bcrypt';
import { UsuarioRepository } from '../../../infrastructure/database/repositories/usuario.repository';
import { Usuario } from '../../../infrastructure/database/entities/usuario.entity';

export class CreateFuncionarioUseCase {
  constructor(
    private readonly funcionarioRepository: FuncionarioRepositoryImpl,
    private readonly usuarioRepository: UsuarioRepository,
  ) {}

  async execute(data: CreateFuncionarioDto): Promise<FuncionarioModel> {
    const hashedPassword = await bcrypt.hash(data.senha, 10);

    const usuario = await this.usuarioRepository.create({
      nome_completo: data.nome_completo,
      email: data.email,
      telefone: data.telefone,
      senha: hashedPassword,
      tipo_usuario: 'funcionario',
    });

    const funcionarioData = {
      ...data,
      id_usuario: usuario.id_usuario,
      senha: undefined,
    };

    return this.funcionarioRepository.create(funcionarioData);
  }
} 