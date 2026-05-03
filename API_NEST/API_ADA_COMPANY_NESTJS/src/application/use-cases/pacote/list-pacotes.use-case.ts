import { Pacote as PacoteModel } from '../../../domain/models/pacote.model';
import { PacoteRepositoryImpl } from '../../../infrastructure/database/repositories/pacote.repository';

export class ListPacotesUseCase {
  constructor(private readonly pacoteRepository: PacoteRepositoryImpl) {}

  async execute(): Promise<PacoteModel[]> {
    return this.pacoteRepository.findAll();
  }
} 