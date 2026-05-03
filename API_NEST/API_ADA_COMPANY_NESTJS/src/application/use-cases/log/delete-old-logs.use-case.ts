import { Injectable, Inject } from '@nestjs/common';
import { LogRepositoryInterface } from '../../../domain/repositories/log.repository.interface';

@Injectable()
export class DeleteOldLogsUseCase {
  constructor(
    @Inject('LogRepositoryInterface')
    private readonly logRepository: LogRepositoryInterface,
  ) {}

  async execute(olderThan: string): Promise<number> {
    return await this.logRepository.deleteOldLogs(olderThan);
  }
}
