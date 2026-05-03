import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Orcamento as OrcamentoEntity } from '../entities/orcamento.entity';
import { OrcamentoRepositoryInterface } from '../../../domain/repositories/orcamento.repository.interface';
import { Orcamento as OrcamentoModel } from '../../../domain/models/orcamento.model';
import { Pacote } from '../entities/pacote.entity';
import { Cliente } from '../entities/cliente.entity';
import { Contrato } from '../entities/contrato.entity';

@Injectable()
export class OrcamentoRepository implements OrcamentoRepositoryInterface {
  constructor(
    @InjectModel(OrcamentoEntity)
    private orcamentoModel: typeof OrcamentoEntity,
  ) {}

  async findAll(): Promise<OrcamentoModel[]> {
    const orcamentos = await this.orcamentoModel.findAll({
      include: [
        {
          model: Pacote,
          include: [Cliente]
        },
        Contrato
      ]
    });
    return orcamentos.map(orcamento => orcamento.toJSON() as OrcamentoModel);
  }

  async findOne(id: string): Promise<OrcamentoModel | null> {
     const orcamento = await this.orcamentoModel.findByPk(id, {
      include: [
        {
          model: Pacote,
          include: [Cliente]
        },
        Contrato
      ]
    });
    return orcamento ? orcamento.toJSON() as OrcamentoModel : null;
  }

   async findById(id: string): Promise<OrcamentoModel | null> {
    const orcamento = await this.orcamentoModel.findByPk(id, {
      include: [
        {
          model: Pacote,
          include: [Cliente]
        },
        Contrato
      ]
    });
    return orcamento ? orcamento.toJSON() as OrcamentoModel : null;
  }

  async findByPacote(id_pacote: string): Promise<OrcamentoModel | null> {
    const orcamento = await this.orcamentoModel.findOne({
      where: { id_pacote },
      include: [
        {
          model: Pacote,
          include: [Cliente]
        },
        Contrato
      ]
    });
     return orcamento ? orcamento.toJSON() as OrcamentoModel : null;
  }

  async findByCliente(id_cliente: string): Promise<OrcamentoModel[]> {
    const orcamentos = await this.orcamentoModel.findAll({
      include: [
        {
          model: Pacote,
          required: true,
          include: [
            {
              model: Cliente,
              required: true,
              where: { id_cliente }
            }
          ]
        },
        Contrato
      ]
    });
    return orcamentos.map(orcamento => orcamento.toJSON() as OrcamentoModel);
  }

  async create(data: Partial<OrcamentoModel>): Promise<OrcamentoModel> {
    const created = await this.orcamentoModel.create(data as any);
    return created.toJSON() as OrcamentoModel;
  }

  async update(id: string, data: Partial<OrcamentoModel>): Promise<[number, OrcamentoModel[]]> {
     const [affectedCount, affectedRows] = await this.orcamentoModel.update(data, {
      where: { cod_orcamento: id },
      returning: true
    });
    // Assumindo que o update no Sequelize retorna as entidades atualizadas
    const updatedOrcamentos = affectedRows.map(orcamento => orcamento.toJSON() as OrcamentoModel);
    return [affectedCount, updatedOrcamentos];
  }

  async delete(id: string): Promise<number> {
    return this.orcamentoModel.destroy({
      where: { cod_orcamento: id }
    });
  }
} 