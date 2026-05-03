import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Contrato } from '../infrastructure/database/entities/contrato.entity';
import { ContratoController } from '../interfaces/http/controllers/contrato.controller';
import { ClienteModule } from '../modules/cliente.module';
import { PacoteModule } from '../modules/pacote.module';
import { FuncionarioModule } from '../modules/funcionario.module';
import { OrcamentoModule } from '../modules/orcamento.module';
import { ContratoRepositoryProvider, CONTRATO_REPOSITORY } from '../infrastructure/providers/contrato.provider';
import { CreateContratoUseCase } from '../application/use-cases/contrato/create-contrato.use-case';
import { ListContratosUseCase } from '../application/use-cases/contrato/list-contratos.use-case';
import { GetContratoUseCase } from '../application/use-cases/contrato/get-contrato.use-case';
import { UpdateContratoUseCase } from '../application/use-cases/contrato/update-contrato.use-case';
import { DeleteContratoUseCase } from '../application/use-cases/contrato/delete-contrato.use-case';
import { SignContratoUseCase } from '../application/use-cases/contrato/sign-contrato.use-case';
import { SignatureService } from '../application/services/signature.service';
import { FileUploadService } from '../application/services/file-upload.service';
import { ORCAMENTO_REPOSITORY } from '../infrastructure/providers/orcamento.provider';

@Module({
  imports: [
    SequelizeModule.forFeature([Contrato]),
    ClienteModule,
    PacoteModule,
    FuncionarioModule,
    OrcamentoModule,
  ],
  controllers: [ContratoController],
  providers: [
    ContratoRepositoryProvider,
    SignatureService,
    FileUploadService,
    {
      provide: CreateContratoUseCase,
      useFactory: (contratoRepo, orcamentoRepo) => new CreateContratoUseCase(contratoRepo, orcamentoRepo),
      inject: [CONTRATO_REPOSITORY, ORCAMENTO_REPOSITORY],
    },
    {
      provide: UpdateContratoUseCase,
      useFactory: (contratoRepo, orcamentoRepo) => new UpdateContratoUseCase(contratoRepo, orcamentoRepo),
      inject: [CONTRATO_REPOSITORY, ORCAMENTO_REPOSITORY],
    },
    {
      provide: ListContratosUseCase,
      useFactory: (repo) => new ListContratosUseCase(repo),
      inject: [CONTRATO_REPOSITORY],
    },
    {
      provide: GetContratoUseCase,
      useFactory: (repo) => new GetContratoUseCase(repo),
      inject: [CONTRATO_REPOSITORY],
    },
    {
      provide: DeleteContratoUseCase,
      useFactory: (repo) => new DeleteContratoUseCase(repo),
      inject: [CONTRATO_REPOSITORY],
    },
    {
      provide: SignContratoUseCase,
      useFactory: (contratoRepo, signatureService) => new SignContratoUseCase(contratoRepo, signatureService),
      inject: [CONTRATO_REPOSITORY, SignatureService],
    },
  ],
  exports: [
    CreateContratoUseCase,
    ListContratosUseCase,
    GetContratoUseCase,
    UpdateContratoUseCase,
    DeleteContratoUseCase,
    CONTRATO_REPOSITORY,
  ]
})
export class ContratoModule {} 