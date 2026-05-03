import { Body, Controller, Get, HttpException, HttpStatus, Post } from '@nestjs/common';
import { LighthouseService } from '../../../infrastructure/providers/lighthouse.service';
import { Public } from '../decorators/public.decorator';

@Controller('mobile/lighthouse')
export class LighthouseController {
  constructor(private readonly lighthouseService: LighthouseService) {}

  @Public()
  @Get('health')
  async healthCheck() {
    return this.getHealthStatus();
  }

  @Public()
  @Get()
  async healthCheckRoot() {
    return this.getHealthStatus();
  }

  private async getHealthStatus() {
    try {
      const health = await this.lighthouseService.checkHealth();
      return {
        status: 'ok',
        ...health,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: error.message || 'Erro ao verificar saúde do serviço',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Public()
  @Post('analyze')
  async checkAccessibility(@Body('url') url: string) {
    console.log(`[LighthouseController] Recebida requisição para analisar: ${url}`);
    
    if (!url) {
      throw new HttpException('URL é obrigatória', HttpStatus.BAD_REQUEST);
    }

    const startTime = Date.now();
    
    try {
      console.log(`[LighthouseController] Iniciando análise do Lighthouse para: ${url}`);
      const result = await this.lighthouseService.runLighthouse(url);
      const duration = Date.now() - startTime;
      console.log(`[LighthouseController] Análise concluída com sucesso em ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error.message || 'Erro desconhecido';
      console.error(`[LighthouseController] Erro após ${duration}ms:`, errorMessage);
      console.error(`[LighthouseController] Stack trace:`, error.stack);
      
      // Se for erro de URL inacessível, retorna BAD_REQUEST
      if (errorMessage.includes('não pôde ser acessada') || 
          errorMessage.includes('Verifique se o endereço')) {
        throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
      }
      
      // Erros de timeout
      if (errorMessage.includes('Timeout') || errorMessage.includes('timeout')) {
        throw new HttpException(
          'A análise demorou muito tempo. Tente novamente ou verifique se o site está acessível.',
          HttpStatus.REQUEST_TIMEOUT
        );
      }
      
      // Erros relacionados ao Chromium
      if (errorMessage.includes('Chromium') || errorMessage.includes('Chrome') || errorMessage.includes('ENOENT')) {
        console.error(`[LighthouseController] Erro crítico do Chromium: ${errorMessage}`);
        throw new HttpException(
          'Erro na configuração do navegador. Entre em contato com o suporte técnico.',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
      
      // Outros erros retornam INTERNAL_SERVER_ERROR
      throw new HttpException(
        `Erro ao analisar o site: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 