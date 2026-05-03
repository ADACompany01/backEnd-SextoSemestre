import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Inject } from '@nestjs/common';
import { FUNCIONARIO_REPOSITORY } from '../../../infrastructure/providers/funcionario.provider';
import { FuncionarioRepository } from '../../../domain/repositories/funcionario.repository.interface';

@Injectable()
export class FuncionarioGuard implements CanActivate {
  constructor(
    @Inject(FUNCIONARIO_REPOSITORY)
    private readonly funcionarioRepository: FuncionarioRepository,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    // CORRIGIDO: Permite acesso APENAS para funcionários
    if (user.tipo_usuario !== 'funcionario') {
      throw new UnauthorizedException('Acesso negado. Apenas funcionários podem acessar este recurso.');
    }

    // Verifica se o funcionário existe no repositório
    try {
      const funcionario = await this.funcionarioRepository.findByEmail(user.email);
      if (!funcionario) {
        throw new UnauthorizedException('Funcionário não encontrado');
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Erro ao verificar funcionário');
    }

    return true;
  }
}