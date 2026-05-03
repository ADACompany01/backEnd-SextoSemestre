import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoDBModule } from '../infrastructure/database/mongodb.module';
import { Notificacao, NotificacaoSchema } from '../infrastructure/database/schemas/notificacao.schema';
import { NotificacaoRepository } from '../infrastructure/database/repositories/notificacao.repository';
import { NotificacaoController } from '../interfaces/http/controllers/notificacao.controller';
import { CreateNotificacaoUseCase } from '../application/use-cases/notificacao/create-notificacao.use-case';
import { GetNotificacoesUseCase } from '../application/use-cases/notificacao/get-notificacoes.use-case';
import { MarcarNotificacaoLidaUseCase } from '../application/use-cases/notificacao/marcar-notificacao-lida.use-case';

@Module({
  imports: [
    MongoDBModule,
    MongooseModule.forFeature([
      { name: Notificacao.name, schema: NotificacaoSchema },
    ]),
  ],
  controllers: [NotificacaoController],
  providers: [
    NotificacaoRepository,
    CreateNotificacaoUseCase,
    GetNotificacoesUseCase,
    MarcarNotificacaoLidaUseCase,
  ],
  exports: [
    NotificacaoRepository,
    CreateNotificacaoUseCase,
    GetNotificacoesUseCase,
    MarcarNotificacaoLidaUseCase,
  ],
})
export class NotificacaoModule {}


