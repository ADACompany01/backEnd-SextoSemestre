import { Injectable, Inject } from '@nestjs/common';
import { LogRepositoryInterface } from '../../../domain/repositories/log.repository.interface';
import { LogModel } from '../../../domain/models/log.model';

@Injectable()
export class GetLogsByLevelUseCase {
  constructor(
    @Inject('LogRepositoryInterface')
    private readonly logRepository: LogRepositoryInterface,
  ) {}

  async execute(level: string, limit?: number, lastEvaluatedKey?: Record<string, any>): Promise<{
    logs: LogModel[];
    lastEvaluatedKey?: Record<string, any>;
  }> {
    return await this.logRepository.findByLevel(level, limit, lastEvaluatedKey);
  }
}
