import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFuncionarioDto {
  @ApiProperty({
    description: 'Nome completo do funcionário',
    example: 'Pedro Silva'
  })
  @IsString({ message: 'O nome completo é obrigatório.' })
  @IsNotEmpty({ message: 'O nome completo é obrigatório.' })
  nome_completo: string;

  @ApiProperty({
    description: 'Email do funcionário',
    example: 'pedro.silva@adacompany.com'
  })
  @IsEmail({}, { message: 'O email informado é inválido.' })
  @IsNotEmpty({ message: 'O email é obrigatório.' })
  email: string;

  @ApiProperty({
    description: 'Telefone do funcionário',
    example: '(11) 97777-7777'
  })
  @IsString({ message: 'O telefone é obrigatório.' })
  @IsNotEmpty({ message: 'O telefone é obrigatório.' })
  telefone: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'senha123'
  })
  @IsString({ message: 'A senha é obrigatória.' })
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres.' })
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  senha: string;
} 