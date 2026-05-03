import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Cliente } from '../infrastructure/database/entities/cliente.entity';
import { Usuario } from '../infrastructure/database/entities/usuario.entity';
import { Funcionario } from '../infrastructure/database/entities/funcionario.entity';
import { ClienteController } from '../interfaces/http/controllers/cliente.controller';
import { ClienteRepositoryProvider, CLIENTE_REPOSITORY } from '../infrastructure/providers/cliente.provider';
import { CreateClienteUseCase } from '../application/use-cases/cliente/create-cliente.use-case';
import { ListClientesUseCase } from '../application/use-cases/cliente/list-clientes.use-case';
import { GetClienteUseCase } from '../application/use-cases/cliente/get-cliente.use-case';
import { GetClienteByUsuarioUseCase } from '../application/use-cases/cliente/get-cliente-by-usuario.use-case';
import { UpdateClienteUseCase } from '../application/use-cases/cliente/update-cliente.use-case';
import { DeleteClienteUseCase } from '../application/use-cases/cliente/delete-cliente.use-case';
import { FuncionarioModule } from '../modules/funcionario.module';
import { DatabaseModule } from '../infrastructure/database/database.module';
import { UsuarioRepository } from '../infrastructure/database/repositories/usuario.repository';

@Module({
  imports: [
    SequelizeModule.forFeature([Cliente, Usuario, Funcionario]),
    forwardRef(() => FuncionarioModule),
    DatabaseModule,
  ],
  controllers: [ClienteController],
  providers: [
    ClienteRepositoryProvider,
    {
      provide: CreateClienteUseCase,
      useFactory: (clienteRepo, usuarioRepo) => new CreateClienteUseCase(clienteRepo, usuarioRepo),
      inject: [CLIENTE_REPOSITORY, UsuarioRepository],
    },
    {
      provide: ListClientesUseCase,
      useFactory: (repo) => new ListClientesUseCase(repo),
      inject: [CLIENTE_REPOSITORY],
    },
    {
      provide: GetClienteUseCase,
      useFactory: (repo) => new GetClienteUseCase(repo),
      inject: [CLIENTE_REPOSITORY],
    },
    {
      provide: GetClienteByUsuarioUseCase,
      useFactory: (repo) => new GetClienteByUsuarioUseCase(repo),
      inject: [CLIENTE_REPOSITORY],
    },
    {
      provide: UpdateClienteUseCase,
      useFactory: (repo) => new UpdateClienteUseCase(repo),
      inject: [CLIENTE_REPOSITORY],
    },
    {
      provide: DeleteClienteUseCase,
      useFactory: (repo) => new DeleteClienteUseCase(repo),
      inject: [CLIENTE_REPOSITORY],
    },
  ],
  exports: [
    CreateClienteUseCase,
    ListClientesUseCase,
    GetClienteUseCase,
    GetClienteByUsuarioUseCase,
    UpdateClienteUseCase,
    DeleteClienteUseCase,
    CLIENTE_REPOSITORY,
  ]
})
export class ClienteModule {}
