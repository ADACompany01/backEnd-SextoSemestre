import { ApiProperty } from '@nestjs/swagger';
import { ClienteResponseDto } from './cliente-response.dto';
import { PacoteResponseDto } from './pacote-response.dto';

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

  @ApiProperty({
    description: 'Caminho do arquivo PDF do orçamento',
    example: 'uploads/orcamentos/orcamento_123.pdf',
    required: false
  })
  arquivo_orcamento?: string;
} 