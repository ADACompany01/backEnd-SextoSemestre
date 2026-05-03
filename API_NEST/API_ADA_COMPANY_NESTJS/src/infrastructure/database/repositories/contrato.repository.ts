import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Contrato } from '../entities/contrato.entity';
import { Orcamento } from '../entities/orcamento.entity';
import { Pacote } from '../entities/pacote.entity';

@Injectable()
export class ContratoRepository {
  constructor(
    @InjectModel(Contrato)
    private contratoModel: typeof Contrato,
  ) {}

  async findAll(): Promise<Contrato[]> {
    return this.contratoModel.findAll({
      include: [{
        model: Orcamento,
        include: [{
          model: Pacote,
          include: ['cliente']
        }]
      }],
    });
  }

  async findOne(id: string): Promise<Contrato | null> {
    return this.contratoModel.findByPk(id, {
      include: [{
        model: Orcamento,
        include: [{
          model: Pacote,
          include: ['cliente']
        }]
      }],
    });
  }

  async findById(id: string): Promise<Contrato | null> {
    return this.contratoModel.findByPk(id, {
      include: [{
        model: Orcamento,
        include: [{
          model: Pacote,
          include: ['cliente']
        }]
      }],
    });
  }

  async create(data: Partial<Contrato>): Promise<Contrato> {
    return this.contratoModel.create(data);
  }

  async update(id: string, data: Partial<Contrato>): Promise<[number, Contrato[]]> {
    return this.contratoModel.update(data, {
      where: { id_contrato: id },
      returning: true,
    });
  }

  async delete(id: string): Promise<number> {
    return this.contratoModel.destroy({
      where: { id_contrato: id },
    });
  }

  async findByCliente(id_cliente: string): Promise<Contrato[]> {
    return this.contratoModel.findAll({
      include: [{
        model: Orcamento,
        include: [{
          model: Pacote,
          where: { id_cliente },
          include: ['cliente']
        }]
      }],
    });
  }

  async findByOrcamento(cod_orcamento: string): Promise<Contrato[]> {
    return this.contratoModel.findAll({
      where: { cod_orcamento },
      include: [{
        model: Orcamento,
        include: [{
          model: Pacote,
          include: ['cliente']
        }]
      }],
    });
  }
} 