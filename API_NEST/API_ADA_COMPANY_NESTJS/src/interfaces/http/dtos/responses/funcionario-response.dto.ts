import { ApiProperty } from '@nestjs/swagger';

class UsuarioDto {
  @ApiProperty({
    description: 'ID do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id_usuario: string;

  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'Pedro Silva'
  })
  nome_completo: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'pedro.silva@adacompany.com'
  })
  email: string;

  @ApiProperty({
    description: 'Telefone do usuário',
    example: '(11) 97777-7777'
  })
  telefone: string;
}

export class FuncionarioResponseDto {
  @ApiProperty({
    description: 'ID do funcionário',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id_funcionario: string;

  @ApiProperty({
    description: 'Nome completo do funcionário',
    example: 'Pedro Silva'
  })
  nome_completo: string;

  @ApiProperty({
    description: 'Email do funcionário',
    example: 'pedro.silva@adacompany.com'
  })
  email: string;

  @ApiProperty({
    description: 'Telefone do funcionário',
    example: '(11) 97777-7777'
  })
  telefone: string;

  @ApiProperty({
    description: 'ID do usuário associado',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id_usuario: string;

  @ApiProperty({
    description: 'Usuário associado',
    type: UsuarioDto
  })
  usuario: UsuarioDto;
} 