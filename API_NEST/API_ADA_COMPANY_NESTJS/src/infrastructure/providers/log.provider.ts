import { Provider } from '@nestjs/common';
import { LogRepositoryInterface } from '../../domain/repositories/log.repository.interface';
import { LogRepository } from '../database/repositories/log.repository';

export const LogRepositoryProvider: Provider = {
  provide: 'LogRepositoryInterface',
  useClass: LogRepository,
};
