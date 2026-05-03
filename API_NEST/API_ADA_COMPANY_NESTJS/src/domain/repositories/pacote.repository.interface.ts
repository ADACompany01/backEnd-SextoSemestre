import { Pacote as PacoteModel } from '../models/pacote.model';
import { CreatePacoteDto } from '../../interfaces/http/dtos/requests/create-pacote.dto';

export interface PacoteRepository {
  create(data: CreatePacoteDto): Promise<PacoteModel>;
  findAll(): Promise<PacoteModel[]>;
  findById(id: string): Promise<PacoteModel | null>;
  update(id: string, data: Partial<PacoteModel>): Promise<[number, PacoteModel[]]>;
  delete(id: string): Promise<number>;
  // Adicione outros métodos conforme necessário
} 