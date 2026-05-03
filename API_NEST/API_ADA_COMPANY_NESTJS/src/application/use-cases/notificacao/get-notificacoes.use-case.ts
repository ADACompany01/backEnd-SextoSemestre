import { Injectable } from '@nestjs/common';
import { NotificacaoRepository } from '../../../infrastructure/database/repositories/notificacao.repository';
import { NotificacaoModel } from '../../../domain/models/notificacao.model';

@Injectable()
export class GetNotificacoesUseCase {
  constructor(private readonly notificacaoRepository: NotificacaoRepository) {}

  async execute(userId: string, apenasNaoLidas: boolean = false): Promise<NotificacaoModel[]> {
    if (apenasNaoLidas) {
      return await this.notificacaoRepository.findNaoLidasByUserId(userId);
    }
    return await this.notificacaoRepository.findByUserId(userId);
  }

  async countNaoLidas(userId: string): Promise<number> {
    return await this.notificacaoRepository.countNaoLidas(userId);
  }
}


