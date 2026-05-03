import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Solicitacao as SolicitacaoEntity } from '../entities/solicitacao.entity';
import { SolicitacaoRepository } from '../../../domain/repositories/solicitacao.repository.interface';
import { Solicitacao as SolicitacaoModel } from '../../../domain/models/solicitacao.model';
import { Cliente } from '../entities/cliente.entity';

@Injectable()
export class SolicitacaoRepositoryImpl implements SolicitacaoRepository {
  constructor(
    @InjectModel(SolicitacaoEntity)
    private solicitacaoModel: typeof SolicitacaoEntity,
  ) {}

  async create(data: Partial<SolicitacaoModel>): Promise<SolicitacaoModel> {
    const created = await this.solicitacaoModel.create(data as any);
    return created.toJSON() as SolicitacaoModel;
  }

  async findAll(): Promise<SolicitacaoModel[]> {
    const solicitacoes = await this.solicitacaoModel.findAll({
      include: [Cliente],
      order: [['createdAt', 'DESC']],
    });
    return solicitacoes.map(s => s.toJSON() as SolicitacaoModel);
  }

  async findById(id: string): Promise<SolicitacaoModel | null> {
    const solicitacao = await this.solicitacaoModel.findByPk(id, {
      include: [Cliente],
    });
    return solicitacao ? solicitacao.toJSON() as SolicitacaoModel : null;
  }

  async findByCliente(id_cliente: string): Promise<SolicitacaoModel[]> {
    const solicitacoes = await this.solicitacaoModel.findAll({
      where: { id_cliente },
      include: [Cliente],
      order: [['createdAt', 'DESC']],
    });
    return solicitacoes.map(s => s.toJSON() as SolicitacaoModel);
  }

  async update(id: string, data: Partial<SolicitacaoModel>): Promise<[number, SolicitacaoModel[]]> {
    const [affectedCount, affectedRows] = await this.solicitacaoModel.update(data, {
      where: { id_solicitacao: id },
      returning: true,
    });
    const updated = affectedRows.map(s => s.toJSON() as SolicitacaoModel);
    return [affectedCount, updated];
  }

  async delete(id: string): Promise<number> {
    return this.solicitacaoModel.destroy({
      where: { id_solicitacao: id },
    });
  }
}

