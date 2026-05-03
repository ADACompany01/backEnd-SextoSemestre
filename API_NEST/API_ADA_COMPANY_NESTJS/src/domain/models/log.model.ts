export interface LogModel {
  id: string; // Partition Key
  timestamp: string; // Sort Key (ISO string format)
  level: LogLevel;
  message: string;
  context?: string;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  responseTime?: number;
  metadata?: Record<string, any>;
  createdAt: string; // ISO string format
  updatedAt: string; // ISO string format
}

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

export interface CreateLogRequest {
  level: LogLevel;
  message: string;
  context?: string;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  responseTime?: number;
  metadata?: Record<string, any>;
  timestamp?: Date;
}

export interface LogFilters {
  level?: LogLevel;
  context?: string;
  userId?: string;
  userEmail?: string;
  startDate?: string; // ISO string format
  endDate?: string; // ISO string format
  limit?: number;
  lastEvaluatedKey?: Record<string, any>; // Para paginação do DynamoDB
}
