import { PartialType } from '@nestjs/mapped-types';
import { CreateOrcamentoDto } from './create-orcamento.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsDateString, IsUUID } from 'class-validator';

export class UpdateOrcamentoDto extends PartialType(CreateOrcamentoDto) {
  @ApiProperty({
    description: 'Valor do orçamento',
    example: 1500.00,
    required: false
  })
  @IsNumber()
  @IsOptional()
  valor_orcamento?: number;

  @ApiProperty({
    description: 'Data do orçamento',
    example: '2024-03-20',
    required: false
  })
  @IsDateString()
  @IsOptional()
  data_orcamento?: Date;

  @ApiProperty({
    description: 'Data de validade do orçamento',
    example: '2024-04-20',
    required: false
  })
  @IsDateString()
  @IsOptional()
  data_validade?: Date;

  @ApiProperty({
    description: 'ID do pacote',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  @IsUUID()
  @IsOptional()
  id_pacote?: string;

  @ApiProperty({
    description: 'Caminho do arquivo PDF do orçamento',
    example: 'uploads/orcamentos/orcamento_123.pdf',
    required: false
  })
  @IsOptional()
  arquivo_orcamento?: string;
} 