import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TipoPacoteSolicitacao {
  A = 'A',
  AA = 'AA',
  AAA = 'AAA'
}

export class CreateSolicitacaoDto {
  @ApiProperty({
    description: 'URL do site a ser avaliado',
    example: 'https://example.com'
  })
  @IsString({ message: 'O site deve ser uma string' })
  @IsNotEmpty({ message: 'O site é obrigatório' })
  site: string;

  @ApiProperty({
    description: 'Tipo do pacote desejado (A, AA ou AAA)',
    example: 'AA',
    enum: TipoPacoteSolicitacao
  })
  @IsEnum(TipoPacoteSolicitacao, { message: 'O tipo do pacote deve ser A, AA ou AAA' })
  @IsNotEmpty({ message: 'O tipo do pacote é obrigatório' })
  tipo_pacote: 'A' | 'AA' | 'AAA';

  @ApiProperty({
    description: 'Observações adicionais',
    example: 'Preciso de acessibilidade completa',
    required: false
  })
  @IsString({ message: 'As observações devem ser uma string' })
  @IsOptional()
  observacoes?: string;

  @ApiProperty({
    description: 'Lista de problemas identificados',
    example: [{ text: 'Contraste baixo', priority: 5 }],
    required: false
  })
  @IsArray()
  @IsOptional()
  selected_issues?: any[];
}

