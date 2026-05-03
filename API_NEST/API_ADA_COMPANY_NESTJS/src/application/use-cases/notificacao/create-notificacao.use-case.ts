import { Injectable } from '@nestjs/common';
import { NotificacaoRepository } from '../../../infrastructure/database/repositories/notificacao.repository';
import { CreateNotificacaoRequest, NotificacaoModel } from '../../../domain/models/notificacao.model';

@Injectable()
export class CreateNotificacaoUseCase {
  constructor(private readonly notificacaoRepository: NotificacaoRepository) {}

  async execute(data: CreateNotificacaoRequest): Promise<NotificacaoModel> {
    return await this.notificacaoRepository.create(data);
  }
}


