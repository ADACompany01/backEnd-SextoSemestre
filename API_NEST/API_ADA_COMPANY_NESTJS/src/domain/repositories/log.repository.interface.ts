import { LogModel, CreateLogRequest, LogFilters } from '../models/log.model';

export interface LogRepositoryInterface {
  create(logData: CreateLogRequest): Promise<LogModel>;
  findById(id: string, timestamp: string): Promise<LogModel | null>;
  findByFilters(filters: LogFilters): Promise<{
    logs: LogModel[];
    lastEvaluatedKey?: Record<string, any>;
  }>;
  findByUserId(userId: string, limit?: number, lastEvaluatedKey?: Record<string, any>): Promise<{
    logs: LogModel[];
    lastEvaluatedKey?: Record<string, any>;
  }>;
  findByLevel(level: string, limit?: number, lastEvaluatedKey?: Record<string, any>): Promise<{
    logs: LogModel[];
    lastEvaluatedKey?: Record<string, any>;
  }>;
  findByDateRange(startDate: string, endDate: string, limit?: number, lastEvaluatedKey?: Record<string, any>): Promise<{
    logs: LogModel[];
    lastEvaluatedKey?: Record<string, any>;
  }>;
  deleteOldLogs(olderThan: string): Promise<number>;
  getLogStats(): Promise<{
    total: number;
    byLevel: Record<string, number>;
    byContext: Record<string, number>;
  }>;
}
