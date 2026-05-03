import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { LogRepositoryInterface } from '../../../domain/repositories/log.repository.interface';
import { LogModel } from '../../../domain/models/log.model';

@Injectable()
export class GetLogUseCase {
  constructor(
    @Inject('LogRepositoryInterface')
    private readonly logRepository: LogRepositoryInterface,
  ) {}

  async execute(id: string, timestamp: string): Promise<LogModel> {
    const log = await this.logRepository.findById(id, timestamp);
    
    if (!log) {
      throw new NotFoundException(`Log com ID ${id} e timestamp ${timestamp} não encontrado`);
    }

    return log;
  }
}
