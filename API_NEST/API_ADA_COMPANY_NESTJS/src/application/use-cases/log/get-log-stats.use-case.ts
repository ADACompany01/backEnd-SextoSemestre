import { Injectable, Inject } from '@nestjs/common';
import { LogRepositoryInterface } from '../../../domain/repositories/log.repository.interface';

@Injectable()
export class GetLogStatsUseCase {
  constructor(
    @Inject('LogRepositoryInterface')
    private readonly logRepository: LogRepositoryInterface,
  ) {}

  async execute(): Promise<{
    total: number;
    byLevel: Record<string, number>;
    byContext: Record<string, number>;
  }> {
    return await this.logRepository.getLogStats();
  }
}
