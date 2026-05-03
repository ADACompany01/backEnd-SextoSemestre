import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Solicitacao } from '../infrastructure/database/entities/solicitacao.entity';
import { Cliente } from '../infrastructure/database/entities/cliente.entity';
import { SolicitacaoController } from '../interfaces/http/controllers/solicitacao.controller';
import { SolicitacaoRepositoryProvider, SOLICITACAO_REPOSITORY } from '../infrastructure/providers/solicitacao.provider';
import { CreateSolicitacaoUseCase } from '../application/use-cases/solicitacao/create-solicitacao.use-case';
import { ListSolicitacoesUseCase } from '../application/use-cases/solicitacao/list-solicitacoes.use-case';
import { GetSolicitacaoUseCase } from '../application/use-cases/solicitacao/get-solicitacao.use-case';
import { GetSolicitacoesByClienteUseCase } from '../application/use-cases/solicitacao/get-solicitacoes-by-cliente.use-case';
import { CreateOrcamentoFromSolicitacaoUseCase } from '../application/use-cases/solicitacao/create-orcamento-from-solicitacao.use-case';
import { UpdateSolicitacaoUseCase } from '../application/use-cases/solicitacao/update-solicitacao.use-case';
import { GetClienteByUsuarioUseCase } from '../application/use-cases/cliente/get-cliente-by-usuario.use-case';
import { CreatePacoteUseCase } from '../application/use-cases/pacote/create-pacote.use-case';
import { CreateOrcamentoUseCase } from '../application/use-cases/orcamento/create-orcamento.use-case';
import { ClienteModule } from './cliente.module';
import { FuncionarioModule } from './funcionario.module';
import { PacoteModule } from './pacote.module';
import { OrcamentoModule } from './orcamento.module';
import { DatabaseModule } from '../infrastructure/database/database.module';
import { CLIENTE_REPOSITORY } from '../infrastructure/providers/cliente.provider';
import { PACOTE_REPOSITORY } from '../infrastructure/providers/pacote.provider';

@Module({
  imports: [
    SequelizeModule.forFeature([Solicitacao, Cliente]),
    forwardRef(() => ClienteModule),
    FuncionarioModule,
    PacoteModule,
    OrcamentoModule,
    DatabaseModule,
  ],
  controllers: [SolicitacaoController],
  providers: [
    SolicitacaoRepositoryProvider,
    {
      provide: CreateSolicitacaoUseCase,
      useFactory: (solicitacaoRepo, clienteRepo) => new CreateSolicitacaoUseCase(solicitacaoRepo, clienteRepo),
      inject: [SOLICITACAO_REPOSITORY, CLIENTE_REPOSITORY],
    },
    {
      provide: ListSolicitacoesUseCase,
      useFactory: (repo) => new ListSolicitacoesUseCase(repo),
      inject: [SOLICITACAO_REPOSITORY],
    },
    {
      provide: GetSolicitacaoUseCase,
      useFactory: (repo) => new GetSolicitacaoUseCase(repo),
      inject: [SOLICITACAO_REPOSITORY],
    },
    {
      provide: GetSolicitacoesByClienteUseCase,
      useFactory: (repo) => new GetSolicitacoesByClienteUseCase(repo),
      inject: [SOLICITACAO_REPOSITORY],
    },
    {
      provide: GetClienteByUsuarioUseCase,
      useFactory: (repo) => new GetClienteByUsuarioUseCase(repo),
      inject: [CLIENTE_REPOSITORY],
    },
    {
      provide: CreateOrcamentoFromSolicitacaoUseCase,
      useFactory: (solicitacaoRepo, createPacoteUseCase, createOrcamentoUseCase, pacoteRepo) => 
        new CreateOrcamentoFromSolicitacaoUseCase(solicitacaoRepo, createPacoteUseCase, createOrcamentoUseCase, pacoteRepo),
      inject: [SOLICITACAO_REPOSITORY, CreatePacoteUseCase, CreateOrcamentoUseCase, PACOTE_REPOSITORY],
    },
    {
      provide: UpdateSolicitacaoUseCase,
      useFactory: (repo) => new UpdateSolicitacaoUseCase(repo),
      inject: [SOLICITACAO_REPOSITORY],
    },
  ],
  exports: [
    CreateSolicitacaoUseCase,
    ListSolicitacoesUseCase,
    GetSolicitacaoUseCase,
    GetSolicitacoesByClienteUseCase,
    SOLICITACAO_REPOSITORY,
  ]
})
export class SolicitacaoModule {}

