import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificacaoRequestDto {
  @ApiProperty({ description: 'Título da notificação' })
  @IsString()
  titulo: string;

  @ApiProperty({ description: 'Mensagem da notificação' })
  @IsString()
  mensagem: string;

  @ApiProperty({ enum: ['info', 'sucesso', 'aviso', 'erro'], description: 'Tipo da notificação' })
  @IsEnum(['info', 'sucesso', 'aviso', 'erro'])
  tipo: 'info' | 'sucesso' | 'aviso' | 'erro';

  @ApiProperty({ description: 'ID do usuário destinatário' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ description: 'Metadados adicionais', type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}


