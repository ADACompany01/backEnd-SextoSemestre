import { PacoteRepositoryImpl } from '../../../infrastructure/database/repositories/pacote.repository';

export class DeletePacoteUseCase {
  constructor(private readonly pacoteRepository: PacoteRepositoryImpl) {}

  async execute(id: string): Promise<number> {
    return this.pacoteRepository.delete(id);
  }
} 