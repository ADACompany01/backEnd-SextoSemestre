import { Controller, Get, Post, Patch, Body, Param, HttpStatus, Logger, HttpException, UseGuards, Request } from '@nestjs/common';
import { CreateSolicitacaoDto } from '../dtos/requests/create-solicitacao.dto';
import { SolicitacaoResponseDto } from '../dtos/responses/solicitacao-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { FuncionarioGuard } from '../guards/funcionario.guard';
import { CreateSolicitacaoUseCase } from '../../../application/use-cases/solicitacao/create-solicitacao.use-case';
import { ListSolicitacoesUseCase } from '../../../application/use-cases/solicitacao/list-solicitacoes.use-case';
import { GetSolicitacaoUseCase } from '../../../application/use-cases/solicitacao/get-solicitacao.use-case';
import { GetSolicitacoesByClienteUseCase } from '../../../application/use-cases/solicitacao/get-solicitacoes-by-cliente.use-case';
import { CreateOrcamentoFromSolicitacaoUseCase } from '../../../application/use-cases/solicitacao/create-orcamento-from-solicitacao.use-case';
import { GetClienteByUsuarioUseCase } from '../../../application/use-cases/cliente/get-cliente-by-usuario.use-case';
import { UpdateSolicitacaoUseCase } from '../../../application/use-cases/solicitacao/update-solicitacao.use-case';
import { UpdateSolicitacaoDto } from '../dtos/requests/update-solicitacao.dto';

@ApiTags('solicitacoes')
@ApiBearerAuth()
@Controller('solicitacoes')
export class SolicitacaoController {
  private readonly logger = new Logger(SolicitacaoController.name);

  constructor(
    private readonly createSolicitacaoUseCase: CreateSolicitacaoUseCase,
    private readonly listSolicitacoesUseCase: ListSolicitacoesUseCase,
    private readonly getSolicitacaoUseCase: GetSolicitacaoUseCase,
    private readonly getSolicitacoesByClienteUseCase: GetSolicitacoesByClienteUseCase,
    private readonly createOrcamentoFromSolicitacaoUseCase: CreateOrcamentoFromSolicitacaoUseCase,
    private readonly getClienteByUsuarioUseCase: GetClienteByUsuarioUseCase,
    private readonly updateSolicitacaoUseCase: UpdateSolicitacaoUseCase,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Criar nova solicitação de orçamento (apenas clientes)' })
  @ApiResponse({ 
    status: 201, 
    description: 'Solicitação criada com sucesso',
    type: SolicitacaoResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Não autorizado'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Apenas clientes podem criar solicitações'
  })
  async create(@Request() req: any, @Body() createSolicitacaoDto: CreateSolicitacaoDto) {
    try {
      const user = req.user;
      if (!user || user.tipo_usuario !== 'cliente') {
        throw new HttpException({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Apenas clientes podem criar solicitações',
        }, HttpStatus.FORBIDDEN);
      }

      // Buscar cliente pelo id_usuario
      const cliente = await this.getClienteByUsuarioUseCase.execute(user.id_usuario);
      if (!cliente) {
        throw new HttpException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Cliente não encontrado',
        }, HttpStatus.NOT_FOUND);
      }

      const solicitacao = await this.createSolicitacaoUseCase.execute(cliente.id_cliente, createSolicitacaoDto);
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Solicitação criada com sucesso',
        data: this.toSolicitacaoResponseDto(solicitacao),
      };
    } catch (error) {
      this.logger.error(`Erro ao criar solicitação: ${error.message}`, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Erro ao criar solicitação: ${error.message}`,
        error: error.name,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(FuncionarioGuard)
  @Get()
  @ApiOperation({ summary: 'Listar todas as solicitações (apenas funcionários)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de solicitações retornada com sucesso',
    type: [SolicitacaoResponseDto]
  })
  async findAll() {
    try {
      const solicitacoes = await this.listSolicitacoesUseCase.execute();
      return {
        statusCode: HttpStatus.OK,
        message: 'Solicitações encontradas com sucesso',
        data: solicitacoes.map(s => this.toSolicitacaoResponseDto(s)),
      };
    } catch (error) {
      this.logger.error(`Erro ao listar solicitações: ${error.message}`, error.stack);
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Erro ao listar solicitações: ${error.message}`,
        error: error.name,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('minhas')
  @ApiOperation({ summary: 'Listar solicitações do cliente logado' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de solicitações retornada com sucesso',
    type: [SolicitacaoResponseDto]
  })
  async findMySolicitacoes(@Request() req: any) {
    try {
      const user = req.user;
      if (!user || user.tipo_usuario !== 'cliente') {
        throw new HttpException({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Apenas clientes podem acessar este recurso',
        }, HttpStatus.FORBIDDEN);
      }

      const cliente = await this.getClienteByUsuarioUseCase.execute(user.id_usuario);
      if (!cliente) {
        throw new HttpException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Cliente não encontrado',
        }, HttpStatus.NOT_FOUND);
      }

      const solicitacoes = await this.getSolicitacoesByClienteUseCase.execute(cliente.id_cliente);
      return {
        statusCode: HttpStatus.OK,
        message: 'Solicitações encontradas com sucesso',
        data: solicitacoes.map(s => this.toSolicitacaoResponseDto(s)),
      };
    } catch (error) {
      this.logger.error(`Erro ao listar solicitações do cliente: ${error.message}`, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Erro ao listar solicitações: ${error.message}`,
        error: error.name,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(FuncionarioGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Buscar solicitação por ID (apenas funcionários)' })
  @ApiParam({ name: 'id', description: 'ID da solicitação' })
  @ApiResponse({ 
    status: 200, 
    description: 'Solicitação encontrada com sucesso',
    type: SolicitacaoResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Solicitação não encontrada'
  })
  async findOne(@Param('id') id: string) {
    try {
      const solicitacao = await this.getSolicitacaoUseCase.execute(id);
      if (!solicitacao) {
        throw new HttpException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Solicitação não encontrada',
        }, HttpStatus.NOT_FOUND);
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Solicitação encontrada com sucesso',
        data: this.toSolicitacaoResponseDto(solicitacao),
      };
    } catch (error) {
      this.logger.error(`Erro ao buscar solicitação: ${error.message}`, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Erro ao buscar solicitação: ${error.message}`,
        error: error.name,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(FuncionarioGuard)
  @Post(':id/criar-orcamento')
  @ApiOperation({ summary: 'Criar orçamento automaticamente a partir de uma solicitação (apenas funcionários)' })
  @ApiParam({ name: 'id', description: 'ID da solicitação' })
  @ApiResponse({ 
    status: 201, 
    description: 'Orçamento criado com sucesso',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            cod_orcamento: { type: 'string' },
            id_pacote: { type: 'string' },
            valor_orcamento: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Solicitação não encontrada'
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Já existe um orçamento para esta solicitação'
  })
  async createOrcamento(@Param('id') id: string, @Body() body?: { valor_orcamento?: number }) {
    try {
      const orcamento = await this.createOrcamentoFromSolicitacaoUseCase.execute(id, body?.valor_orcamento);
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Orçamento criado com sucesso',
        data: {
          cod_orcamento: orcamento.cod_orcamento,
          id_pacote: orcamento.id_pacote,
          valor_orcamento: orcamento.valor_orcamento,
        },
      };
    } catch (error) {
      this.logger.error(`Erro ao criar orçamento para solicitação ${id}: ${error.message}`, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Erro ao criar orçamento: ${error.message}`,
        error: error.name,
      }, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar status de uma solicitação (clientes podem atualizar suas próprias solicitações)' })
  @ApiParam({ name: 'id', description: 'ID da solicitação' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Solicitação atualizada com sucesso',
    type: SolicitacaoResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Solicitação não encontrada',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Apenas o dono da solicitação pode atualizá-la',
  })
  async update(@Request() req: any, @Param('id') id: string, @Body() updateDto: UpdateSolicitacaoDto) {
    try {
      const user = req.user;
      
      // Verificar se a solicitação existe
      const solicitacao = await this.getSolicitacaoUseCase.execute(id);
      if (!solicitacao) {
        throw new HttpException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Solicitação não encontrada',
        }, HttpStatus.NOT_FOUND);
      }

      // Se for cliente, verificar se é o dono da solicitação
      if (user.tipo_usuario === 'cliente') {
        const cliente = await this.getClienteByUsuarioUseCase.execute(user.id_usuario);
        if (!cliente || cliente.id_cliente !== solicitacao.id_cliente) {
          throw new HttpException({
            statusCode: HttpStatus.FORBIDDEN,
            message: 'Você só pode atualizar suas próprias solicitações',
          }, HttpStatus.FORBIDDEN);
        }
      }

      // Atualizar a solicitação
      const updatedSolicitacao = await this.updateSolicitacaoUseCase.execute(id, updateDto);

      return {
        statusCode: HttpStatus.OK,
        message: 'Solicitação atualizada com sucesso',
        data: this.toSolicitacaoResponseDto(updatedSolicitacao),
      };
    } catch (error) {
      this.logger.error(`Erro ao atualizar solicitação ${id}: ${error.message}`, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Erro ao atualizar solicitação: ${error.message}`,
        error: error.name,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private toSolicitacaoResponseDto(solicitacao: any): SolicitacaoResponseDto {
    return {
      id_solicitacao: solicitacao.id_solicitacao,
      id_cliente: solicitacao.id_cliente,
      site: solicitacao.site,
      tipo_pacote: solicitacao.tipo_pacote,
      observacoes: solicitacao.observacoes,
      selected_issues: solicitacao.selected_issues,
      status: solicitacao.status,
      id_pacote: solicitacao.id_pacote,
      cod_orcamento: solicitacao.cod_orcamento,
      createdAt: solicitacao.createdAt,
      updatedAt: solicitacao.updatedAt,
      cliente: solicitacao.cliente ? {
        id_cliente: solicitacao.cliente.id_cliente,
        nome_completo: solicitacao.cliente.nome_completo,
        email: solicitacao.cliente.email,
      } : undefined,
    };
  }
}

