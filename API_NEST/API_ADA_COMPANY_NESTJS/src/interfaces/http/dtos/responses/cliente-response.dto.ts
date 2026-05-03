import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({
    description: 'Telefone do cliente',
    example: '(11) 98765-4321'
  })
  telefone: string;

  @ApiProperty({
    description: 'ID do usuário associado',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id_usuario: string;
  @ApiProperty({
    description: 'Data de criação',
    example: '2024-05-10T10:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2024-05-10T10:30:00.000Z'
  })
  updatedAt: Date;
}
