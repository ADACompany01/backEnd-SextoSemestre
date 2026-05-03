import { IsOptional, IsNumber, IsDate, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StatusContrato } from './create-contrato.dto';

export class UpdateContratoDto {
  @ApiProperty({
    description: 'Código do orçamento',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  @IsUUID('4', { message: 'O código do orçamento deve ser um UUID válido.' })
  @IsOptional()
  cod_orcamento?: string;

  @ApiProperty({
    description: 'Valor do contrato',
    example: 5000.00,
    required: false
  })
  @IsNumber({}, { message: 'O valor do contrato deve ser um número.' })
  @IsOptional()
  valor_contrato?: number;

  @ApiProperty({
    description: 'Status do contrato',
    enum: StatusContrato,
    example: StatusContrato.EM_ANALISE,
    required: false
  })
  @IsEnum(StatusContrato, { message: 'O status do contrato deve ser EM_ANALISE, EM_ANDAMENTO, CONCLUIDO ou CANCELADO.' })
  @IsOptional()
  status_contrato?: StatusContrato;

  @ApiProperty({
    description: 'Data de início do contrato',
    example: '2024-05-01',
    required: false
  })
  @IsDate({ message: 'A data de início deve ser uma data válida.' })
  @IsOptional()
  data_inicio?: Date;

  @ApiProperty({
    description: 'Data de entrega do contrato',
    example: '2024-05-30',
    required: false
  })
  @IsDate({ message: 'A data de entrega deve ser uma data válida.' })
  @IsOptional()
  data_entrega?: Date;

  @ApiProperty({
    description: 'Caminho do arquivo PDF do contrato',
    example: 'uploads/contratos/contrato_123.pdf',
    required: false
  })
  @IsOptional()
  arquivo_contrato?: string;

  @ApiProperty({
    description: 'Caminho do arquivo PDF do contrato assinado',
    example: 'uploads/contratos-assinados/contrato_123_assinado.pdf',
    required: false
  })
  @IsOptional()
  contrato_assinado_url?: string;
} 