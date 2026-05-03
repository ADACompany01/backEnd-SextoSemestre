import { Injectable, Inject, LoggerService as NestLoggerService } from '@nestjs/common';
import { CreateLogUseCase } from '../use-cases/log/create-log.use-case';
import { LogLevel } from '../../domain/models/log.model';

@Injectable()
export class LoggingService implements NestLoggerService {
  constructor(
    @Inject('CreateLogUseCase')
    private readonly createLogUseCase: CreateLogUseCase,
  ) {}

  async log(level: LogLevel, message: string, context?: string, metadata?: Record<string, any>): Promise<void> {
    try {
      await this.createLogUseCase.execute({
        level,
        message,
        context,
        metadata,
        timestamp: new Date(),
      });
    } catch (error) {
      // Fallback para console se o DynamoDB não estiver disponível
      console.error('Erro ao salvar log no DynamoDB:', error);
      console.log(`[${level.toUpperCase()}] ${context ? `[${context}] ` : ''}${message}`, metadata);
    }
  }

  async error(message: string, context?: string, metadata?: Record<string, any>): Promise<void> {
    await this.log(LogLevel.ERROR, message, context, metadata);
  }

  async warn(message: string, context?: string, metadata?: Record<string, any>): Promise<void> {
    await this.log(LogLevel.WARN, message, context, metadata);
  }

  async info(message: string, context?: string, metadata?: Record<string, any>): Promise<void> {
    await this.log(LogLevel.INFO, message, context, metadata);
  }

  async debug(message: string, context?: string, metadata?: Record<string, any>): Promise<void> {
    await this.log(LogLevel.DEBUG, message, context, metadata);
  }

  async verbose(message: string, context?: string, metadata?: Record<string, any>): Promise<void> {
    await this.log(LogLevel.VERBOSE, message, context, metadata);
  }

  // Métodos para logging de requisições HTTP
  async logHttpRequest(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    userId?: string,
    userEmail?: string,
    ipAddress?: string,
    userAgent?: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const level = statusCode >= 500 ? LogLevel.ERROR : 
                  statusCode >= 400 ? LogLevel.WARN : 
                  LogLevel.INFO;

    await this.createLogUseCase.execute({
      level,
      message: `${method} ${url} - ${statusCode}`,
      context: 'HTTP',
      userId,
      userEmail,
      ipAddress,
      userAgent,
      method,
      url,
      statusCode,
      responseTime,
      timestamp: new Date(),
      metadata,
    });
  }

  // Método para logging de erros de aplicação
  async logError(
    error: Error,
    context?: string,
    userId?: string,
    userEmail?: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.createLogUseCase.execute({
      level: LogLevel.ERROR,
      message: error.message,
      context,
      userId,
      userEmail,
      timestamp: new Date(),
      metadata: {
        stack: error.stack,
        name: error.name,
        ...metadata,
      },
    });
  }
}
