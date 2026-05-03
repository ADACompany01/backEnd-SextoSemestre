import { ApiProperty } from '@nestjs/swagger';
import { TipoPacote } from '../../../../infrastructure/database/entities/pacote.entity';
import { StatusContrato } from '../../../../infrastructure/database/entities/contrato.entity';

export class CommonResponseDto<T> {
  @ApiProperty({ description: 'Indica se a operação foi bem sucedida' })
  success: boolean;

  @ApiProperty({ description: 'Mensagem descritiva sobre o resultado da operação' })
  message: string;

  @ApiProperty({ description: 'Dados retornados pela operação', required: false })
  data?: T;

  @ApiProperty({ description: 'Erro ocorrido durante a operação', required: false })
  error?: string;

  constructor(success: boolean, message: string, data?: T, error?: string) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.error = error;
  }

  static success<T>(message: string, data?: T): CommonResponseDto<T> {
    return new CommonResponseDto<T>(true, message, data);
  }

  static error(message: string, error?: string): CommonResponseDto<null> {
    return new CommonResponseDto<null>(false, message, null, error);
  }
}

export class ClienteResponseDto {
  @ApiProperty({
    description: 'ID do cliente',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id_cliente: string;

  @ApiProperty({
    description: 'Nome do cliente',
    example: 'João Silva'
  })
  nome_completo: string;

  @ApiProperty({
    description: 'CNPJ do cliente',
    example: '12.345.678/0001-90'
  })
  cnpj: string;

  @ApiProperty({
    description: 'Email do cliente',
    example: 'joao.silva@email.com'
  })
  email: string;
}

export class PacoteResponseDto {
  @ApiProperty({
    description: 'ID do pacote',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id_pacote: string;

  @ApiProperty({
    description: 'ID do cliente',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id_cliente: string;

  @ApiProperty({
    description: 'Tipo do pacote',
    example: 'AA',
    enum: TipoPacote
  })
  tipo_pacote: TipoPacote;

  @ApiProperty({
    description: 'Valor base do pacote',
    example: 1500.00
  })
  valor_base: number;

  @ApiProperty({
    description: 'Data de criação do pacote',
    example: '2024-03-20T10:00:00Z'
  })
  created_at: Date;

  @ApiProperty({
    description: 'Data da última atualização do pacote',
    example: '2024-03-20T10:00:00Z'
  })
  updated_at: Date;

  @ApiProperty({
    description: 'Cliente associado',
    type: ClienteResponseDto
  })
  cliente: ClienteResponseDto;
}

export class OrcamentoResponseDto {
  @ApiProperty({
    description: 'Código do orçamento',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  cod_orcamento: string;

  @ApiProperty({
    description: 'Valor do orçamento',
    example: 1500.00
  })
  valor_orcamento: number;

  @ApiProperty({
    description: 'Data do orçamento',
    example: '2024-03-21T10:00:00Z'
  })
  data_orcamento: Date;

  @ApiProperty({
    description: 'Data de validade do orçamento',
    example: '2024-04-21T10:00:00Z'
  })
  data_validade: Date;

  @ApiProperty({
    description: 'ID do pacote',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id_pacote: string;

  @ApiProperty({
    description: 'ID do cliente',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id_cliente: string;

  @ApiProperty({
    description: 'Pacote associado',
    type: PacoteResponseDto
  })
  pacote: PacoteResponseDto;

  @ApiProperty({
    description: 'Cliente associado',
    type: ClienteResponseDto
  })
  cliente: ClienteResponseDto;
}

export class ContratoResponseDto {
  @ApiProperty({
    description: 'ID do contrato',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id_contrato: string;

  @ApiProperty({
    description: 'ID do cliente',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id_cliente: string;

  @ApiProperty({
    description: 'Valor do contrato',
    example: 5000.00
  })
  valor_contrato: number;

  @ApiProperty({
    description: 'Código do orçamento',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  cod_orcamento: string;

  @ApiProperty({
    description: 'Status do contrato',
    enum: StatusContrato,
    example: StatusContrato.EM_ANALISE
  })
  status_contrato: StatusContrato;

  @ApiProperty({
    description: 'Data de início do contrato',
    example: '2024-05-01'
  })
  data_inicio: Date;

  @ApiProperty({
    description: 'Data de entrega do contrato',
    example: '2024-05-30'
  })
  data_entrega: Date;

  @ApiProperty({
    description: 'Cliente associado',
    type: ClienteResponseDto
  })
  cliente: ClienteResponseDto;

  @ApiProperty({
    description: 'Orçamento associado',
    type: OrcamentoResponseDto
  })
  orcamento: OrcamentoResponseDto;
} 