import { Injectable } from '@nestjs/common';
import { NotificacaoRepository } from '../../../infrastructure/database/repositories/notificacao.repository';
import { NotificacaoModel } from '../../../domain/models/notificacao.model';

@Injectable()
export class MarcarNotificacaoLidaUseCase {
  constructor(private readonly notificacaoRepository: NotificacaoRepository) {}

  async execute(id: string, userId: string): Promise<NotificacaoModel | null> {
    return await this.notificacaoRepository.marcarComoLida(id, userId);
  }

  async marcarTodas(userId: string): Promise<number> {
    return await this.notificacaoRepository.marcarTodasComoLidas(userId);
  }
}


