import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Funcionario as FuncionarioEntity } from '../entities/funcionario.entity';
import { FuncionarioRepository } from '../../../domain/repositories/funcionario.repository.interface';
import { Funcionario as FuncionarioModel } from '../../../domain/models/funcionario.model';
import { Usuario } from '../entities/usuario.entity';
import { CreateFuncionarioDto } from '../../../interfaces/http/dtos/requests/create-funcionario.dto';

@Injectable()
export class FuncionarioRepositoryImpl implements FuncionarioRepository {
  constructor(
    @InjectModel(FuncionarioEntity)
    private funcionarioModel: typeof FuncionarioEntity,
  ) {}

  async create(data: CreateFuncionarioDto): Promise<FuncionarioModel> {
    const created = await this.funcionarioModel.create(data as any);
    return created.toJSON() as FuncionarioModel;
  }

  async findAll(): Promise<FuncionarioEntity[]> {
    return this.funcionarioModel.findAll({ include: [Usuario] });
  }

  async findById(id: string): Promise<FuncionarioEntity | null> {
    return this.funcionarioModel.findByPk(id, { include: [Usuario] });
  }

  async update(id: string, data: Partial<FuncionarioModel>): Promise<[number, FuncionarioModel[]]> {
    const [affectedCount, affectedRows] = await this.funcionarioModel.update(data, {
      where: { id_funcionario: id },
      returning: true,
    });
    return [affectedCount, affectedRows as any];
  }

  async delete(id: string): Promise<number> {
    return this.funcionarioModel.destroy({
      where: { id_funcionario: id },
    });
  }

  async findByEmail(email: string): Promise<FuncionarioEntity | null> {
    return this.funcionarioModel.findOne({
      where: { email },
    });
  }
} 