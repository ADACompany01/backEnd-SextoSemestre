import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateClienteDto {
  @ApiProperty({
    description: 'Nome do cliente',
    example: 'João Silva',
    required: false
  })
  @IsString()
  @IsOptional()
  nome_completo?: string;

  @ApiProperty({
    description: 'CNPJ do cliente',
    example: '12.345.678/0001-90',
    required: false
  })
  @IsString()
  @IsOptional()
  cnpj?: string;

  @ApiProperty({
    description: 'Email do cliente',
    example: 'joao.silva@email.com',
    required: false
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Telefone do cliente',
    example: '(11) 98765-4321',
    required: false
  })
  @IsString()
  @IsOptional()
  telefone?: string;
} 