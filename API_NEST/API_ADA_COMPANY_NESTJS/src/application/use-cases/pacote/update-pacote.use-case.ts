import { Pacote as PacoteModel } from '../../../domain/models/pacote.model';
import { PacoteRepositoryImpl } from '../../../infrastructure/database/repositories/pacote.repository';
import { UpdatePacoteDto } from '../../../interfaces/http/dtos/requests/update-pacote.dto';

export class UpdatePacoteUseCase {
  constructor(private readonly pacoteRepository: PacoteRepositoryImpl) {}

  async execute(id: string, data: UpdatePacoteDto): Promise<PacoteModel> {
    await this.pacoteRepository.update(id, data);
    return this.pacoteRepository.findById(id);
  }
} 