import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificacaoDocument = Notificacao & Document;

@Schema({ timestamps: true, collection: 'notificacoes' })
export class Notificacao {
  @Prop({ required: true })
  titulo: string;

  @Prop({ required: true })
  mensagem: string;

  @Prop({ required: true })
  tipo: 'info' | 'sucesso' | 'aviso' | 'erro';

  @Prop({ required: true })
  userId: string;

  @Prop({ default: false })
  lida: boolean;

  @Prop()
  dataLeitura?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const NotificacaoSchema = SchemaFactory.createForClass(Notificacao);

// Índices para melhor performance
NotificacaoSchema.index({ userId: 1, lida: 1 });
NotificacaoSchema.index({ createdAt: -1 });


