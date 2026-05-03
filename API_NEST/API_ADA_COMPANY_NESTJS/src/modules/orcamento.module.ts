import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Orcamento } from '../infrastructure/database/entities/orcamento.entity';
import { OrcamentoController } from '../interfaces/http/controllers/orcamento.controller';
import { ClienteModule } from './cliente.module';
import { PacoteModule } from './pacote.module';
import { FuncionarioModule } from '../modules/funcionario.module';
import { OrcamentoRepositoryProvider, ORCAMENTO_REPOSITORY } from '../infrastructure/providers/orcamento.provider';
import { CreateOrcamentoUseCase } from '../application/use-cases/orcamento/create-orcamento.use-case';
import { ListOrcamentosUseCase } from '../application/use-cases/orcamento/list-orcamentos.use-case';
import { GetOrcamentoUseCase } from '../application/use-cases/orcamento/get-orcamento.use-case';
import { UpdateOrcamentoUseCase } from '../application/use-cases/orcamento/update-orcamento.use-case';
import { DeleteOrcamentoUseCase } from '../application/use-cases/orcamento/delete-orcamento.use-case';
import { FileUploadService } from '../application/services/file-upload.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Orcamento]),
    ClienteModule,
    PacoteModule,
    FuncionarioModule,
  ],
  controllers: [OrcamentoController],
  providers: [
    OrcamentoRepositoryProvider,
    FileUploadService,
    {
      provide: CreateOrcamentoUseCase,
      useFactory: (repo, pacoteRepo) => new CreateOrcamentoUseCase(repo, pacoteRepo),
      inject: [ORCAMENTO_REPOSITORY, 'PACOTE_REPOSITORY'],
    },
    {
      provide: ListOrcamentosUseCase,
      useFactory: (repo) => new ListOrcamentosUseCase(repo),
      inject: [ORCAMENTO_REPOSITORY],
    },
    {
      provide: GetOrcamentoUseCase,
      useFactory: (repo) => new GetOrcamentoUseCase(repo),
      inject: [ORCAMENTO_REPOSITORY],
    },
    {
      provide: UpdateOrcamentoUseCase,
      useFactory: (repo) => new UpdateOrcamentoUseCase(repo),
      inject: [ORCAMENTO_REPOSITORY],
    },
    {
      provide: DeleteOrcamentoUseCase,
      useFactory: (repo) => new DeleteOrcamentoUseCase(repo),
      inject: [ORCAMENTO_REPOSITORY],
    },
  ],
  exports: [
    CreateOrcamentoUseCase,
    ListOrcamentosUseCase,
    GetOrcamentoUseCase,
    UpdateOrcamentoUseCase,
    DeleteOrcamentoUseCase,
    ORCAMENTO_REPOSITORY
  ]
})
export class OrcamentoModule {}