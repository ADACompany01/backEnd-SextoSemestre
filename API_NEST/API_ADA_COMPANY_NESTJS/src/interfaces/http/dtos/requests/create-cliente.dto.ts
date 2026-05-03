import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClienteDto {
  @ApiProperty({
    description: 'Nome completo do cliente',
    example: 'João Silva'
  })
  @IsString({ message: 'O nome deve ser uma string' })
  @IsNotEmpty({ message: 'O nome não pode estar vazio' })
  nome_completo: string;

  @ApiProperty({
    description: 'CNPJ do cliente',
    example: '12.345.678/0001-90'
  })
  @IsString({ message: 'O CNPJ deve ser uma string' })
  @IsNotEmpty({ message: 'O CNPJ não pode estar vazio' })
  cnpj: string;

  @ApiProperty({
    description: 'Email do cliente',
    example: 'joao.silva@email.com'
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'O email não pode estar vazio' })
  email: string;

  @ApiProperty({
    description: 'Telefone do cliente',
    example: '(11) 98765-4321'
  })
  @IsString({ message: 'O telefone deve ser uma string' })
  @IsNotEmpty({ message: 'O telefone não pode estar vazio' })
  telefone: string;

  @ApiProperty({
    description: 'Senha do cliente',
    example: 'senha123',
    minLength: 6
  })
  @IsString({ message: 'A senha deve ser uma string' })
  @IsNotEmpty({ message: 'A senha não pode estar vazia' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  senha: string;
} 