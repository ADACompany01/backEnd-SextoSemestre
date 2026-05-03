import { IsNotEmpty, IsNumber, IsDateString, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum StatusContrato {
  EM_ANALISE = 'EM_ANALISE',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO'
}

export class CreateContratoDto {
  @ApiProperty({
    description: 'Código do orçamento',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID('4', { message: 'O código do orçamento deve ser um UUID válido.' })
  @IsNotEmpty({ message: 'O código do orçamento é obrigatório.' })
  cod_orcamento: string;

  @ApiProperty({
    description: 'Valor do contrato',
    example: 5000.00
  })
  @IsNumber({}, { message: 'O valor do contrato deve ser um número.' })
  @IsNotEmpty({ message: 'O valor do contrato é obrigatório.' })
  valor_contrato: number;

  @ApiProperty({
    description: 'Status do contrato',
    enum: StatusContrato,
    example: StatusContrato.EM_ANALISE
  })
  @IsEnum(StatusContrato, { message: 'O status do contrato deve ser EM_ANALISE, EM_ANDAMENTO, CONCLUIDO ou CANCELADO.' })
  @IsNotEmpty({ message: 'O status do contrato é obrigatório.' })
  status_contrato: StatusContrato;

  @ApiProperty({
    description: 'Data de início do contrato',
    example: '2024-05-01'
  })
  @IsDateString({}, { message: 'A data de início deve ser uma data válida no formato ISO (YYYY-MM-DD).' })
  @IsNotEmpty({ message: 'A data de início é obrigatória.' })
  data_inicio: string;

  @ApiProperty({
    description: 'Data de entrega do contrato',
    example: '2024-05-30'
  })
  @IsDateString({}, { message: 'A data de entrega deve ser uma data válida no formato ISO (YYYY-MM-DD).' })
  @IsNotEmpty({ message: 'A data de entrega é obrigatória.' })
  data_entrega: string;
} 