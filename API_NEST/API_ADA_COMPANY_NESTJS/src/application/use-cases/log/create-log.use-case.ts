import { Injectable, Inject } from '@nestjs/common';
import { LogRepositoryInterface } from '../../../domain/repositories/log.repository.interface';
import { CreateLogRequest, LogModel } from '../../../domain/models/log.model';

@Injectable()
export class CreateLogUseCase {
  constructor(
    @Inject('LogRepositoryInterface')
    private readonly logRepository: LogRepositoryInterface,
  ) {}

  async execute(logData: CreateLogRequest): Promise<LogModel> {
    return await this.logRepository.create(logData);
  }
}
