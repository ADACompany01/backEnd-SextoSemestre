import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum StatusSolicitacao {
  PENDENTE = 'PENDENTE',
  EM_ANALISE = 'EM_ANALISE',
  ORCAMENTO_CRIADO = 'ORCAMENTO_CRIADO',
  ORCAMENTO_APROVADO = 'ORCAMENTO_APROVADO',
  CANCELADA = 'CANCELADA',
}

export class UpdateSolicitacaoDto {
  @ApiProperty({
    description: 'Status da solicitação',
    enum: StatusSolicitacao,
    required: false,
    example: 'ORCAMENTO_CRIADO',
  })
  @IsOptional()
  @IsEnum(StatusSolicitacao)
  status?: StatusSolicitacao;

  @ApiProperty({
    description: 'Observações adicionais',
    required: false,
    example: 'Observações sobre a solicitação',
  })
  @IsOptional()
  @IsString()
  observacoes?: string;

  @ApiProperty({
    description: 'ID do pacote associado',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  id_pacote?: string;

  @ApiProperty({
    description: 'Código do orçamento associado',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  cod_orcamento?: string;
}

