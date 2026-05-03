import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LogLevel } from '../../../../domain/models/log.model';

export class LogResponseDto {
  @ApiProperty({ description: 'ID único do log' })
  id: string;

  @ApiProperty({ enum: LogLevel, description: 'Nível do log' })
  level: LogLevel;

  @ApiProperty({ description: 'Mensagem do log' })
  message: string;

  @ApiPropertyOptional({ description: 'Contexto do log' })
  context?: string;

  @ApiPropertyOptional({ description: 'ID do usuário' })
  userId?: string;

  @ApiPropertyOptional({ description: 'Email do usuário' })
  userEmail?: string;

  @ApiPropertyOptional({ description: 'Endereço IP' })
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'User Agent' })
  userAgent?: string;

  @ApiPropertyOptional({ description: 'Método HTTP' })
  method?: string;

  @ApiPropertyOptional({ description: 'URL da requisição' })
  url?: string;

  @ApiPropertyOptional({ description: 'Código de status HTTP' })
  statusCode?: number;

  @ApiPropertyOptional({ description: 'Tempo de resposta em ms' })
  responseTime?: number;

  @ApiPropertyOptional({ description: 'Metadados adicionais' })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Timestamp do log' })
  timestamp: string;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: string;

  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: string;
}
