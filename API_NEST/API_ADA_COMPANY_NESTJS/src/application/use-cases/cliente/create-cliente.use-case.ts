import { Cliente } from '../../../infrastructure/database/entities/cliente.entity';
import { ClienteRepositoryImpl } from '../../../infrastructure/database/repositories/cliente.repository';
import { CreateClienteDto } from '../../../interfaces/http/dtos/requests/create-cliente.dto';
import { UsuarioRepository } from '../../../infrastructure/database/repositories/usuario.repository';
import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus } from '@nestjs/common';

export class CreateClienteUseCase {
  constructor(
    private readonly clienteRepository: ClienteRepositoryImpl,
    private readonly usuarioRepository: UsuarioRepository,
  ) {}

  async execute(data: CreateClienteDto): Promise<Cliente> {
    try {
      // Check if email already exists
      const existingUser = await this.usuarioRepository.findByEmail(data.email);
      if (existingUser) {
        throw new HttpException('Email já cadastrado', HttpStatus.BAD_REQUEST);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.senha, 10);

      // Create associated user
      const usuario = await this.usuarioRepository.create({
        nome_completo: data.nome_completo,
        email: data.email,
        senha: hashedPassword,
        telefone: data.telefone,
        tipo_usuario: 'cliente',
      });

      // Create cliente with the associated user's ID
      const cliente = await this.clienteRepository.create({
        nome_completo: data.nome_completo,
        email: data.email,
        cnpj: data.cnpj,
        telefone: data.telefone,
        id_usuario: usuario.id_usuario,
      });

      // Retorna o cliente com o usuário associado
      return this.clienteRepository.findById(cliente.id_cliente);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Erro ao criar cliente: ${error.message}`,
        error: error.name,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 