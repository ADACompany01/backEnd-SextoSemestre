import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NotificacaoResponseDto {
  @ApiProperty({ description: 'ID da notificação' })
  _id: string;

  @ApiProperty({ description: 'Título da notificação' })
  titulo: string;

  @ApiProperty({ description: 'Mensagem da notificação' })
  mensagem: string;

  @ApiProperty({ enum: ['info', 'sucesso', 'aviso', 'erro'], description: 'Tipo da notificação' })
  tipo: 'info' | 'sucesso' | 'aviso' | 'erro';

  @ApiProperty({ description: 'ID do usuário destinatário' })
  userId: string;

  @ApiProperty({ description: 'Indica se a notificação foi lida' })
  lida: boolean;

  @ApiPropertyOptional({ description: 'Data de leitura' })
  dataLeitura?: Date;

  @ApiPropertyOptional({ description: 'Metadados adicionais', type: Object })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: Date;
}


