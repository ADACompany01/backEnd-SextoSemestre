import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Pacote as PacoteEntity } from '../entities/pacote.entity';
import { PacoteRepository } from '../../../domain/repositories/pacote.repository.interface';
import { Pacote as PacoteModel } from '../../../domain/models/pacote.model';
import { Cliente } from '../entities/cliente.entity';
import { Orcamento } from '../entities/orcamento.entity';
import { CreatePacoteDto } from '../../../interfaces/http/dtos/requests/create-pacote.dto';

@Injectable()
export class PacoteRepositoryImpl implements PacoteRepository {
  constructor(
    @InjectModel(PacoteEntity)
    private pacoteModel: typeof PacoteEntity,
  ) {}

  async create(data: CreatePacoteDto): Promise<PacoteModel> {
    const created = await this.pacoteModel.create(data as any);
    return created.toJSON() as PacoteModel;
  }

  async findAll(): Promise<PacoteModel[]> {
    const pacotes = await this.pacoteModel.findAll({
      include: [
        Cliente,
        Orcamento
      ]
    });
    return pacotes.map(p => p.toJSON() as PacoteModel);
  }

  async findById(id: string): Promise<PacoteModel | null> {
    const pacote = await this.pacoteModel.findByPk(id, {
      include: [
        Cliente,
        Orcamento
      ]
    });
    return pacote ? (pacote.toJSON() as PacoteModel) : null;
  }

  async update(id: string, data: Partial<PacoteModel>): Promise<[number, PacoteModel[]]> {
    const [affectedCount, affectedRows] = await this.pacoteModel.update(data, {
      where: { id_pacote: id },
      returning: true,
    });
    return [affectedCount, affectedRows as any];
  }

  async delete(id: string): Promise<number> {
    return this.pacoteModel.destroy({
      where: { id_pacote: id },
    });
  }

  async findByCliente(id_cliente: number): Promise<PacoteModel[]> {
    const pacotes = await this.pacoteModel.findAll({
      where: { id_cliente },
      include: [
        Cliente,
        Orcamento
      ]
    });
    return pacotes.map(p => p.toJSON() as PacoteModel);
  }
} 