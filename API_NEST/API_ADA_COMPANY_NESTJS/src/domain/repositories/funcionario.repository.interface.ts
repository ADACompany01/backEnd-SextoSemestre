import { Funcionario } from '../models/funcionario.model';
import { CreateFuncionarioDto } from '../../interfaces/http/dtos/requests/create-funcionario.dto';

export interface FuncionarioRepository {
  create(data: CreateFuncionarioDto): Promise<Funcionario>;
  findAll(): Promise<Funcionario[]>;
  findById(id: string): Promise<Funcionario | null>;
  update(id: string, data: Partial<Funcionario>): Promise<[number, Funcionario[]]>;
  delete(id: string): Promise<number>;
  findByEmail(email: string): Promise<Funcionario | null>;
  // Adicione outros métodos conforme necessário
} 