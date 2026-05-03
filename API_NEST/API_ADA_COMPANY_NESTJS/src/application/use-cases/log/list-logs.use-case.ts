import { Injectable, Inject } from '@nestjs/common';
import { LogRepositoryInterface } from '../../../domain/repositories/log.repository.interface';
import { LogModel, LogFilters } from '../../../domain/models/log.model';

@Injectable()
export class ListLogsUseCase {
  constructor(
    @Inject('LogRepositoryInterface')
    private readonly logRepository: LogRepositoryInterface,
  ) {}

  async execute(filters: LogFilters): Promise<{
    logs: LogModel[];
    lastEvaluatedKey?: Record<string, any>;
  }> {
    return await this.logRepository.findByFilters(filters);
  }
}
