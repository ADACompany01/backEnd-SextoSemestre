import { Solicitacao } from '../models/solicitacao.model';

export interface SolicitacaoRepository {
  create(solicitacao: Partial<Solicitacao>): Promise<Solicitacao>;
  findAll(): Promise<Solicitacao[]>;
  findById(id: string): Promise<Solicitacao | null>;
  findByCliente(id_cliente: string): Promise<Solicitacao[]>;
  update(id: string, data: Partial<Solicitacao>): Promise<[number, Solicitacao[]]>;
  delete(id: string): Promise<number>;
}

