import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Usuario } from '../entities/usuario.entity';
import { Cliente } from '../entities/cliente.entity';
import { Funcionario } from '../entities/funcionario.entity';

@Injectable()
export class UsuarioRepository {
  constructor(
    @InjectModel(Usuario)
    private usuarioModel: typeof Usuario,
  ) {}

  async findAll(): Promise<Usuario[]> {
    return this.usuarioModel.findAll({ include: [Cliente, Funcionario] });
  }

  async findOne(id: string): Promise<Usuario | null> {
    return this.usuarioModel.findByPk(id, { include: [Cliente, Funcionario] });
  }

  async create(data: Partial<Usuario>): Promise<Usuario> {
    return this.usuarioModel.create(data);
  }

  async update(id: string, data: Partial<Usuario>): Promise<[number, Usuario[]]> {
    const [affectedCount, affectedRows] = await this.usuarioModel.update(data, {
      where: { id_usuario: id },
      returning: true,
    });
    return [affectedCount, affectedRows];
  }

  async delete(id: string): Promise<number> {
    return this.usuarioModel.destroy({
      where: { id_usuario: id },
    });
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioModel.findOne({
      where: { email },
      include: [Cliente, Funcionario],
    });
  }
} 