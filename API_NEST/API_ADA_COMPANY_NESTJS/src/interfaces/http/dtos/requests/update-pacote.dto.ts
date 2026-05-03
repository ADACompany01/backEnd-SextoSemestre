import { IsOptional, IsNumber, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TipoPacote } from './create-pacote.dto';

export class UpdatePacoteDto {
  @ApiProperty({
    description: 'ID do cliente',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  @IsUUID('4', { message: 'O ID do cliente deve ser um UUID válido.' })
  @IsOptional()
  id_cliente?: string;

  @ApiProperty({
    description: 'Tipo do pacote (A, AA ou AAA)',
    enum: TipoPacote,
    example: TipoPacote.AA,
    required: false
  })
  @IsEnum(TipoPacote, { message: 'O tipo do pacote deve ser A, AA ou AAA.' })
  @IsOptional()
  tipo_pacote?: TipoPacote;

  @ApiProperty({
    description: 'Valor base do pacote',
    example: 1500.00,
    required: false
  })
  @IsNumber({}, { message: 'O valor base deve ser um número.' })
  @IsOptional()
  valor_base?: number;
} 