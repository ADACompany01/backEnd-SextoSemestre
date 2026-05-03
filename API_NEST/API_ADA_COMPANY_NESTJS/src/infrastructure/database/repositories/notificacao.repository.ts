import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notificacao, NotificacaoDocument } from '../schemas/notificacao.schema';
import { NotificacaoModel, CreateNotificacaoRequest } from '../../../domain/models/notificacao.model';

@Injectable()
export class NotificacaoRepository {
  constructor(
    @InjectModel(Notificacao.name) private notificacaoModel: Model<NotificacaoDocument>,
  ) {}

  // Helper para converter documento do Mongoose para NotificacaoModel
  private toNotificacaoModel(doc: NotificacaoDocument | null): NotificacaoModel | null {
    if (!doc) return null;
    const docAny = doc as any; // Para acessar campos timestamps adicionados pelo Mongoose
    return {
      _id: doc._id.toString(),
      titulo: doc.titulo,
      mensagem: doc.mensagem,
      tipo: doc.tipo,
      userId: doc.userId,
      lida: doc.lida,
      dataLeitura: doc.dataLeitura,
      metadata: doc.metadata,
      createdAt: docAny.createdAt,
      updatedAt: docAny.updatedAt,
    };
  }

  // Helper para converter array de documentos
  private toNotificacaoModelArray(docs: NotificacaoDocument[]): NotificacaoModel[] {
    return docs.map(doc => this.toNotificacaoModel(doc)!);
  }

  async create(data: CreateNotificacaoRequest): Promise<NotificacaoModel> {
    const notificacao = new this.notificacaoModel(data);
    const saved = await notificacao.save();
    return this.toNotificacaoModel(saved)!;
  }

  async findById(id: string): Promise<NotificacaoModel | null> {
    const doc = await this.notificacaoModel.findById(id).exec();
    return this.toNotificacaoModel(doc);
  }

  async findByUserId(userId: string, limit: number = 50): Promise<NotificacaoModel[]> {
    const docs = await this.notificacaoModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
    return this.toNotificacaoModelArray(docs);
  }

  async findNaoLidasByUserId(userId: string): Promise<NotificacaoModel[]> {
    const docs = await this.notificacaoModel
      .find({ userId, lida: false })
      .sort({ createdAt: -1 })
      .exec();
    return this.toNotificacaoModelArray(docs);
  }

  async marcarComoLida(id: string, userId: string): Promise<NotificacaoModel | null> {
    const doc = await this.notificacaoModel
      .findOneAndUpdate(
        { _id: id, userId },
        { lida: true, dataLeitura: new Date() },
        { new: true },
      )
      .exec();
    return this.toNotificacaoModel(doc);
  }

  async marcarTodasComoLidas(userId: string): Promise<number> {
    const result = await this.notificacaoModel
      .updateMany(
        { userId, lida: false },
        { lida: true, dataLeitura: new Date() },
      )
      .exec();
    return result.modifiedCount;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.notificacaoModel
      .deleteOne({ _id: id, userId })
      .exec();
    return result.deletedCount > 0;
  }

  async countNaoLidas(userId: string): Promise<number> {
    return await this.notificacaoModel.countDocuments({ userId, lida: false }).exec();
  }
}


