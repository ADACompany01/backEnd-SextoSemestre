import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggingService } from '../../../application/services/logging.service';

@Catch()
export class LoggingExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject('LoggingService')
    private readonly loggingService: LoggingService,
  ) {}

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';

    const user = (request as any).user;
    const userId = user?.id;
    const userEmail = user?.email;

    // Log do erro
    try {
      if (exception instanceof Error) {
        await this.loggingService.logError(
          exception,
          'ExceptionFilter',
          userId,
          userEmail,
          {
            method: request.method,
            url: request.url,
            ip: request.ip,
            userAgent: request.headers['user-agent'],
            status,
          },
        );
      } else {
        await this.loggingService.error(
          `Erro não tratado: ${JSON.stringify(exception)}`,
          'ExceptionFilter',
          {
            method: request.method,
            url: request.url,
            ip: request.ip,
            userAgent: request.headers['user-agent'],
            status,
            userId,
            userEmail,
          },
        );
      }
    } catch (logError) {
      console.error('Erro ao logar exceção:', logError);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: typeof message === 'string' ? message : (message as any).message,
    });
  }
}
