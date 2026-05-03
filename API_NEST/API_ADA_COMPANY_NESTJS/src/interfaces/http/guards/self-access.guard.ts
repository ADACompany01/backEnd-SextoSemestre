import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { GetClienteUseCase } from '../../../application/use-cases/cliente/get-cliente.use-case';
import { Cliente as ClienteModel } from '../../../domain/models/cliente.model';

@Injectable()
export class SelfAccessGuard implements CanActivate {
  private readonly logger = new Logger(SelfAccessGuard.name);

  constructor(private readonly getClienteUseCase: GetClienteUseCase) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const id = request.params.id;

    this.logger.debug(`User from token: ${JSON.stringify(user)}`);
    this.logger.debug(`ID from route: ${id}`);

    if (!user) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    // Se for funcionário, permite o acesso
    if (user.tipo_usuario === 'funcionario') {
      return true;
    }

    // Se for cliente, verifica se está acessando seus próprios dados
    if (user.tipo_usuario === 'cliente') {
      try {
        // Busca o cliente pelo ID da rota usando o use-case
        const cliente = await this.getClienteUseCase.execute(id);
        if (!cliente) {
          throw new UnauthorizedException('Cliente não encontrado');
        }

        // Compara o id_usuario do token com o id_usuario do cliente
        const tokenUserId = String(user.id_usuario);
        const clienteUserId = String((cliente as ClienteModel).id_usuario); // Assumindo que o model tem id_usuario
        
        this.logger.debug(`Token User ID: ${tokenUserId}`);
        this.logger.debug(`Cliente User ID: ${clienteUserId}`);

        if (tokenUserId === clienteUserId) {
          return true;
        }
      } catch (error) {
        this.logger.error(`Erro ao buscar cliente: ${error.message}`);
        throw new UnauthorizedException('Erro ao verificar permissões');
      }
    }

    throw new UnauthorizedException('Você não tem permissão para acessar estes dados');
  }
} 