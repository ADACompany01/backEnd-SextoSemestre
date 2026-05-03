import { ApiProperty } from '@nestjs/swagger';

export class SolicitacaoResponseDto {
  @ApiProperty()
  id_solicitacao: string;

  @ApiProperty()
  id_cliente: string;

  @ApiProperty()
  site: string;

  @ApiProperty()
  tipo_pacote: 'A' | 'AA' | 'AAA';

  @ApiProperty({ required: false })
  observacoes?: string;

  @ApiProperty({ required: false })
  selected_issues?: any;

  @ApiProperty()
  status: 'PENDENTE' | 'EM_ANALISE' | 'ORCAMENTO_CRIADO' | 'ORCAMENTO_APROVADO' | 'CANCELADA';

  @ApiProperty({ required: false })
  id_pacote?: string;

  @ApiProperty({ required: false })
  cod_orcamento?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  cliente?: {
    id_cliente: string;
    nome_completo: string;
    email: string;
  };
}

