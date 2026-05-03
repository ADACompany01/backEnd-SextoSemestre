import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Funcionario } from '../infrastructure/database/entities/funcionario.entity';
import { Usuario } from '../infrastructure/database/entities/usuario.entity';
import { FuncionarioController } from '../interfaces/http/controllers/funcionario.controller';
import { FuncionarioRepositoryProvider, FUNCIONARIO_REPOSITORY } from '../infrastructure/providers/funcionario.provider';
import { CreateFuncionarioUseCase } from '../application/use-cases/funcionario/create-funcionario.use-case';
import { ListFuncionariosUseCase } from '../application/use-cases/funcionario/list-funcionarios.use-case';
import { GetFuncionarioUseCase } from '../application/use-cases/funcionario/get-funcionario.use-case';
import { GetFuncionarioByEmailUseCase } from '../application/use-cases/funcionario/get-funcionario-by-email.use-case';
import { UpdateFuncionarioUseCase } from '../application/use-cases/funcionario/update-funcionario.use-case';
import { DeleteFuncionarioUseCase } from '../application/use-cases/funcionario/delete-funcionario.use-case';
import { UsuarioRepository } from '../infrastructure/database/repositories/usuario.repository';
import { ClienteModule } from '../modules/cliente.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Funcionario, Usuario]),
    ClienteModule,
  ],
  controllers: [FuncionarioController],
  providers: [
    FuncionarioRepositoryProvider,
    UsuarioRepository,
    {
      provide: CreateFuncionarioUseCase,
      useFactory: (funcionarioRepo, usuarioRepo) => new CreateFuncionarioUseCase(funcionarioRepo, usuarioRepo),
      inject: [FUNCIONARIO_REPOSITORY, UsuarioRepository],
    },
    {
      provide: ListFuncionariosUseCase,
      useFactory: (repo) => new ListFuncionariosUseCase(repo),
      inject: [FUNCIONARIO_REPOSITORY],
    },
    {
      provide: GetFuncionarioUseCase,
      useFactory: (repo) => new GetFuncionarioUseCase(repo),
      inject: [FUNCIONARIO_REPOSITORY],
    },
    {
      provide: GetFuncionarioByEmailUseCase,
      useFactory: (repo) => new GetFuncionarioByEmailUseCase(repo),
      inject: [FUNCIONARIO_REPOSITORY],
    },
    {
      provide: UpdateFuncionarioUseCase,
      useFactory: (repo) => new UpdateFuncionarioUseCase(repo),
      inject: [FUNCIONARIO_REPOSITORY],
    },
    {
      provide: DeleteFuncionarioUseCase,
      useFactory: (repo) => new DeleteFuncionarioUseCase(repo),
      inject: [FUNCIONARIO_REPOSITORY],
    },
  ],
  exports: [
    CreateFuncionarioUseCase,
    ListFuncionariosUseCase,
    GetFuncionarioUseCase,
    GetFuncionarioByEmailUseCase,
    UpdateFuncionarioUseCase,
    DeleteFuncionarioUseCase,
    FUNCIONARIO_REPOSITORY,
    UsuarioRepository,
    FuncionarioRepositoryProvider
  ]
})
export class FuncionarioModule {}