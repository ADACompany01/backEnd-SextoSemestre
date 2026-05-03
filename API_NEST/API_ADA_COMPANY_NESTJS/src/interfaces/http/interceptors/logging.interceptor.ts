import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { LoggingService } from '../../../application/services/logging.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject('LoggingService')
    private readonly loggingService: LoggingService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();

    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'];

    // Extrair informações do usuário se disponível (assumindo que está no JWT)
    const user = (request as any).user;
    const userId = user?.id;
    const userEmail = user?.email;

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - startTime;
          const statusCode = response.statusCode;

          // Log assíncrono para não bloquear a resposta
          this.loggingService.logHttpRequest(
            method,
            url,
            statusCode,
            responseTime,
            userId,
            userEmail,
            ip,
            userAgent,
          ).catch(error => {
            console.error('Erro ao logar requisição HTTP:', error);
          });
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          const statusCode = error.status || 500;

          // Log de erro assíncrono
          this.loggingService.logHttpRequest(
            method,
            url,
            statusCode,
            responseTime,
            userId,
            userEmail,
            ip,
            userAgent,
            { error: error.message, stack: error.stack },
          ).catch(logError => {
            console.error('Erro ao logar requisição HTTP com erro:', logError);
          });
        },
      }),
    );
  }
}
