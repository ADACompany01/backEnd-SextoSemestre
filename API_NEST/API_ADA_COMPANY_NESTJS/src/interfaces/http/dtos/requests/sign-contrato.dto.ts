import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignContratoDto {
  @ApiProperty({
    description: 'ID do contrato a ser assinado',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'O ID do contrato deve ser um UUID válido.' })
  @IsNotEmpty({ message: 'O ID do contrato é obrigatório.' })
  contrato_id: string;

  @ApiProperty({
    description: 'Assinatura em base64 (PNG ou JPEG)',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
  })
  @IsString({ message: 'A assinatura deve ser uma string em base64.' })
  @IsNotEmpty({ message: 'A assinatura é obrigatória.' })
  signature: string;
}

