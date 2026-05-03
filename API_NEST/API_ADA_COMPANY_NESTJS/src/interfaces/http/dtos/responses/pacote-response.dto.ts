import { ApiProperty } from '@nestjs/swagger';

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
    example: 'AA'
  })
  tipo_pacote: string;

  @ApiProperty({
    description: 'Valor base do pacote',
    example: 1500.00
  })
  valor_base: number;
} 