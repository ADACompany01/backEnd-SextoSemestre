import { IsEnum, IsString, IsOptional, IsNumber, IsObject, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LogLevel } from '../../../../domain/models/log.model';

export class CreateLogRequestDto {
  @ApiProperty({ enum: LogLevel, description: 'Nível do log' })
  @IsEnum(LogLevel)
  level: LogLevel;

  @ApiProperty({ description: 'Mensagem do log' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Contexto do log' })
  @IsOptional()
  @IsString()
  context?: string;

  @ApiPropertyOptional({ description: 'ID do usuário' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Email do usuário' })
  @IsOptional()
  @IsString()
  userEmail?: string;

  @ApiPropertyOptional({ description: 'Endereço IP' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'User Agent' })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({ description: 'Método HTTP' })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional({ description: 'URL da requisição' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ description: 'Código de status HTTP' })
  @IsOptional()
  @IsNumber()
  statusCode?: number;

  @ApiPropertyOptional({ description: 'Tempo de resposta em ms' })
  @IsOptional()
  @IsNumber()
  responseTime?: number;

  @ApiPropertyOptional({ description: 'Metadados adicionais' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
