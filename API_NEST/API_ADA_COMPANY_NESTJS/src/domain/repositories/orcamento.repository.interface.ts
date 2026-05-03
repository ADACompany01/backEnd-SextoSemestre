import { Orcamento as OrcamentoModel } from '../models/orcamento.model';

export interface OrcamentoRepositoryInterface {
  create(data: Partial<OrcamentoModel>): Promise<OrcamentoModel>;
  findById(cod_orcamento: string): Promise<OrcamentoModel | null>;
  findAll(): Promise<OrcamentoModel[]>;
  update(cod_orcamento: string, data: Partial<OrcamentoModel>): Promise<[number, OrcamentoModel[]]>;
  delete(cod_orcamento: string): Promise<number>;
} 