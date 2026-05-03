import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateLogUseCase } from '../../../application/use-cases/log/create-log.use-case';
import { GetLogUseCase } from '../../../application/use-cases/log/get-log.use-case';
import { ListLogsUseCase } from '../../../application/use-cases/log/list-logs.use-case';
import { GetLogsByUserUseCase } from '../../../application/use-cases/log/get-logs-by-user.use-case';
import { GetLogsByLevelUseCase } from '../../../application/use-cases/log/get-logs-by-level.use-case';
import { GetLogsByDateRangeUseCase } from '../../../application/use-cases/log/get-logs-by-date-range.use-case';
import { DeleteOldLogsUseCase } from '../../../application/use-cases/log/delete-old-logs.use-case';
import { GetLogStatsUseCase } from '../../../application/use-cases/log/get-log-stats.use-case';
import { CreateLogRequestDto } from '../dtos/requests/create-log.request.dto';
import { ListLogsRequestDto } from '../dtos/requests/list-logs.request.dto';
import { DeleteOldLogsRequestDto } from '../dtos/requests/delete-old-logs.request.dto';
import { LogResponseDto } from '../dtos/responses/log.response.dto';
import { LogStatsResponseDto } from '../dtos/responses/log-stats.response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LogFilters } from '../../../domain/models/log.model';

@ApiTags('Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('logs')
export class LogController {
  constructor(
    private readonly createLogUseCase: CreateLogUseCase,
    private readonly getLogUseCase: GetLogUseCase,
    private readonly listLogsUseCase: ListLogsUseCase,
    private readonly getLogsByUserUseCase: GetLogsByUserUseCase,
    private readonly getLogsByLevelUseCase: GetLogsByLevelUseCase,
    private readonly getLogsByDateRangeUseCase: GetLogsByDateRangeUseCase,
    private readonly deleteOldLogsUseCase: DeleteOldLogsUseCase,
    private readonly getLogStatsUseCase: GetLogStatsUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo log' })
  @ApiResponse({ status: 201, description: 'Log criado com sucesso', type: LogResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(@Body() createLogDto: CreateLogRequestDto): Promise<LogResponseDto> {
    return await this.createLogUseCase.execute(createLogDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obter estatísticas dos logs' })
  @ApiResponse({ status: 200, description: 'Estatísticas obtidas com sucesso', type: LogStatsResponseDto })
  async getStats(): Promise<LogStatsResponseDto> {
    return await this.getLogStatsUseCase.execute();
  }

  @Get()
  @ApiOperation({ summary: 'Listar logs com filtros' })
  @ApiResponse({ status: 200, description: 'Lista de logs obtida com sucesso', type: [LogResponseDto] })
  async list(@Query() query: ListLogsRequestDto): Promise<{
    logs: LogResponseDto[];
    lastEvaluatedKey?: Record<string, any>;
  }> {
    const filters: LogFilters = {
      level: query.level,
      context: query.context,
      userId: query.userId,
      userEmail: query.userEmail,
      startDate: query.startDate,
      endDate: query.endDate,
      limit: query.limit,
      lastEvaluatedKey: query.lastEvaluatedKey ? JSON.parse(query.lastEvaluatedKey) : undefined,
    };

    return await this.listLogsUseCase.execute(filters);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Obter logs de um usuário específico' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limite de resultados' })
  @ApiQuery({ name: 'lastEvaluatedKey', required: false, description: 'Chave para paginação' })
  @ApiResponse({ status: 200, description: 'Logs do usuário obtidos com sucesso', type: [LogResponseDto] })
  async getByUser(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
    @Query('lastEvaluatedKey') lastEvaluatedKey?: string,
  ): Promise<{
    logs: LogResponseDto[];
    lastEvaluatedKey?: Record<string, any>;
  }> {
    const parsedKey = lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined;
    return await this.getLogsByUserUseCase.execute(userId, limit, parsedKey);
  }

  @Get('level/:level')
  @ApiOperation({ summary: 'Obter logs por nível' })
  @ApiParam({ name: 'level', description: 'Nível do log (error, warn, info, debug, verbose)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limite de resultados' })
  @ApiQuery({ name: 'lastEvaluatedKey', required: false, description: 'Chave para paginação' })
  @ApiResponse({ status: 200, description: 'Logs por nível obtidos com sucesso', type: [LogResponseDto] })
  async getByLevel(
    @Param('level') level: string,
    @Query('limit') limit?: number,
    @Query('lastEvaluatedKey') lastEvaluatedKey?: string,
  ): Promise<{
    logs: LogResponseDto[];
    lastEvaluatedKey?: Record<string, any>;
  }> {
    const parsedKey = lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined;
    return await this.getLogsByLevelUseCase.execute(level, limit, parsedKey);
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Obter logs por intervalo de datas' })
  @ApiQuery({ name: 'startDate', description: 'Data de início (ISO string)' })
  @ApiQuery({ name: 'endDate', description: 'Data de fim (ISO string)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limite de resultados' })
  @ApiQuery({ name: 'lastEvaluatedKey', required: false, description: 'Chave para paginação' })
  @ApiResponse({ status: 200, description: 'Logs por intervalo de datas obtidos com sucesso', type: [LogResponseDto] })
  async getByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('limit') limit?: number,
    @Query('lastEvaluatedKey') lastEvaluatedKey?: string,
  ): Promise<{
    logs: LogResponseDto[];
    lastEvaluatedKey?: Record<string, any>;
  }> {
    const parsedKey = lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined;
    return await this.getLogsByDateRangeUseCase.execute(
      startDate,
      endDate,
      limit,
      parsedKey,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter um log específico por ID e timestamp' })
  @ApiParam({ name: 'id', description: 'ID do log' })
  @ApiQuery({ name: 'timestamp', description: 'Timestamp do log (ISO string)' })
  @ApiResponse({ status: 200, description: 'Log obtido com sucesso', type: LogResponseDto })
  @ApiResponse({ status: 404, description: 'Log não encontrado' })
  async getById(
    @Param('id') id: string,
    @Query('timestamp') timestamp: string,
  ): Promise<LogResponseDto> {
    return await this.getLogUseCase.execute(id, timestamp);
  }

  @Post('cleanup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deletar logs antigos' })
  @ApiResponse({ status: 200, description: 'Logs antigos deletados com sucesso' })
  async deleteOldLogs(@Body() deleteOldLogsDto: DeleteOldLogsRequestDto): Promise<{ deletedCount: number }> {
    const deletedCount = await this.deleteOldLogsUseCase.execute(deleteOldLogsDto.olderThan);
    return { deletedCount };
  }
}
