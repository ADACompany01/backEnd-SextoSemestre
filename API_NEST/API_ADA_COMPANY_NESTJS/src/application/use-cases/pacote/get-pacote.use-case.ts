import { Pacote as PacoteModel } from '../../../domain/models/pacote.model';
import { PacoteRepositoryImpl } from '../../../infrastructure/database/repositories/pacote.repository';

export class GetPacoteUseCase {
  constructor(private readonly pacoteRepository: PacoteRepositoryImpl) {}

  async execute(id: string): Promise<PacoteModel | null> {
    return this.pacoteRepository.findById(id);
  }
} 