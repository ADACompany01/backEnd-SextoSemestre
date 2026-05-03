import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * ThrottlerGuard customizado que ignora requisições OPTIONS (preflight CORS)
 * Isso garante que as requisições de preflight não sejam bloqueadas pelo rate limiting
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Permitir requisições OPTIONS (preflight CORS) sem aplicar throttling
    if (request.method === 'OPTIONS') {
      return true;
    }
    
    // Para outras requisições, aplicar o throttling normal
    return super.canActivate(context);
  }
}

