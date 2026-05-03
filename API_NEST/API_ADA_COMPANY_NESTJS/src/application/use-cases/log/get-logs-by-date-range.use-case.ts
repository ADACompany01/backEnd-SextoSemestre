import { Injectable, Inject } from '@nestjs/common';
import { LogRepositoryInterface } from '../../../domain/repositories/log.repository.interface';
import { LogModel } from '../../../domain/models/log.model';

@Injectable()
export class GetLogsByDateRangeUseCase {
  constructor(
    @Inject('LogRepositoryInterface')
    private readonly logRepository: LogRepositoryInterface,
  ) {}

  async execute(startDate: string, endDate: string, limit?: number, lastEvaluatedKey?: Record<string, any>): Promise<{
    logs: LogModel[];
    lastEvaluatedKey?: Record<string, any>;
  }> {
    return await this.logRepository.findByDateRange(startDate, endDate, limit, lastEvaluatedKey);
  }
}
