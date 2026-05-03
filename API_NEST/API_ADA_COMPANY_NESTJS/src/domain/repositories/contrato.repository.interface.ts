import { Contrato } from '../models/contrato.model';

export interface ContratoRepositoryInterface {
  create(data: Partial<Contrato>): Promise<Contrato>;
  findById(cod_contrato: string): Promise<Contrato | null>;
  findAll(): Promise<Contrato[]>;
  update(cod_contrato: string, data: Partial<Contrato>): Promise<Contrato>;
  delete(cod_contrato: string): Promise<void>;
} 