import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateNotificacaoUseCase } from '../../../application/use-cases/notificacao/create-notificacao.use-case';
import { GetNotificacoesUseCase } from '../../../application/use-cases/notificacao/get-notificacoes.use-case';
import { MarcarNotificacaoLidaUseCase } from '../../../application/use-cases/notificacao/marcar-notificacao-lida.use-case';
import { CreateNotificacaoRequestDto } from '../dtos/requests/create-notificacao.request.dto';
import { NotificacaoResponseDto } from '../dtos/responses/notificacao.response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GetUser } from '../decorators/get-user.decorator';

@ApiTags('notificacoes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notificacoes')
export class NotificacaoController {
  constructor(
    private readonly createNotificacaoUseCase: CreateNotificacaoUseCase,
    private readonly getNotificacoesUseCase: GetNotificacoesUseCase,
    private readonly marcarNotificacaoLidaUseCase: MarcarNotificacaoLidaUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova notificação' })
  @ApiResponse({ status: 201, description: 'Notificação criada com sucesso', type: NotificacaoResponseDto })
  async create(@Body() createDto: CreateNotificacaoRequestDto) {
    return await this.createNotificacaoUseCase.execute(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar notificações do usuário' })
  @ApiQuery({ name: 'apenasNaoLidas', required: false, type: Boolean, description: 'Filtrar apenas não lidas' })
  @ApiResponse({ status: 200, description: 'Lista de notificações', type: [NotificacaoResponseDto] })
  async list(
    @GetUser('id') userId: string,
    @Query('apenasNaoLidas') apenasNaoLidas?: string,
  ) {
    const apenasNaoLidasBool = apenasNaoLidas === 'true';
    return await this.getNotificacoesUseCase.execute(userId, apenasNaoLidasBool);
  }

  @Get('count')
  @ApiOperation({ summary: 'Contar notificações não lidas' })
  @ApiResponse({ status: 200, description: 'Contagem de notificações não lidas' })
  async countNaoLidas(@GetUser('id') userId: string) {
    const count = await this.getNotificacoesUseCase.countNaoLidas(userId);
    return { count };
  }

  @Post(':id/marcar-lida')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  @ApiParam({ name: 'id', description: 'ID da notificação' })
  @ApiResponse({ status: 200, description: 'Notificação marcada como lida', type: NotificacaoResponseDto })
  async marcarLida(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ) {
    return await this.marcarNotificacaoLidaUseCase.execute(id, userId);
  }

  @Post('marcar-todas-lidas')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar todas as notificações como lidas' })
  @ApiResponse({ status: 200, description: 'Número de notificações marcadas como lidas' })
  async marcarTodasLidas(@GetUser('id') userId: string) {
    const count = await this.marcarNotificacaoLidaUseCase.marcarTodas(userId);
    return { count };
  }
}

