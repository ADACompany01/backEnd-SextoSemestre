import { ApiProperty } from '@nestjs/swagger';
import { ClienteResponseDto } from './cliente-response.dto';
import { OrcamentoResponseDto } from './orcamento-response.dto';
import { StatusContrato } from '../requests/create-contrato.dto';

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

  @ApiProperty({
    description: 'Caminho do arquivo PDF do contrato',
    example: 'uploads/contratos/contrato_123.pdf',
    required: false
  })
  arquivo_contrato?: string;

  @ApiProperty({
    description: 'Caminho do arquivo PDF do contrato assinado',
    example: 'uploads/contratos-assinados/contrato_123_assinado.pdf',
    required: false
  })
  contrato_assinado_url?: string;
} 