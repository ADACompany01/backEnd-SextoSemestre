import { Cliente } from '../models/cliente.model';

export interface ClienteRepository {
  create(cliente: Cliente): Promise<Cliente>;
  findAll(): Promise<Cliente[]>;
  findById(id: string): Promise<Cliente | null>;
  update(id: string, data: Partial<Cliente>): Promise<[number, Cliente[]]>;
  delete(id: string): Promise<number>;
  findByEmail(email: string): Promise<Cliente | null>;
  findByIdUsuario(id_usuario: string): Promise<Cliente | null>;
  // Adicione outros métodos conforme necessário
} 