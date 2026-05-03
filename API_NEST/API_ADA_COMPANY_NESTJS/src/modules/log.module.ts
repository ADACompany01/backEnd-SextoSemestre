import { Module } from '@nestjs/common';
import { DynamoDBModule } from '../infrastructure/database/dynamodb.module';
import { LogRepository } from '../infrastructure/database/repositories/log.repository';
import { LogRepositoryProvider } from '../infrastructure/providers/log.provider';
import { LogController } from '../interfaces/http/controllers/log.controller';
import { CreateLogUseCase } from '../application/use-cases/log/create-log.use-case';
import { GetLogUseCase } from '../application/use-cases/log/get-log.use-case';
import { ListLogsUseCase } from '../application/use-cases/log/list-logs.use-case';
import { GetLogsByUserUseCase } from '../application/use-cases/log/get-logs-by-user.use-case';
import { GetLogsByLevelUseCase } from '../application/use-cases/log/get-logs-by-level.use-case';
import { GetLogsByDateRangeUseCase } from '../application/use-cases/log/get-logs-by-date-range.use-case';
import { DeleteOldLogsUseCase } from '../application/use-cases/log/delete-old-logs.use-case';
import { GetLogStatsUseCase } from '../application/use-cases/log/get-log-stats.use-case';
import { LoggingService } from '../application/services/logging.service';

@Module({
  imports: [DynamoDBModule],
  controllers: [LogController],
  providers: [
    LogRepository,
    LogRepositoryProvider,
    CreateLogUseCase,
    GetLogUseCase,
    ListLogsUseCase,
    GetLogsByUserUseCase,
    GetLogsByLevelUseCase,
    GetLogsByDateRangeUseCase,
    DeleteOldLogsUseCase,
    GetLogStatsUseCase,
    LoggingService,
    {
      provide: 'CreateLogUseCase',
      useClass: CreateLogUseCase,
    },
    {
      provide: 'LoggingService',
      useClass: LoggingService,
    },
  ],
  exports: [
    CreateLogUseCase,
    GetLogUseCase,
    ListLogsUseCase,
    GetLogsByUserUseCase,
    GetLogsByLevelUseCase,
    GetLogsByDateRangeUseCase,
    DeleteOldLogsUseCase,
    GetLogStatsUseCase,
    LogRepositoryProvider,
    LoggingService,
    'LoggingService',
  ],
})
export class LogModule {}
