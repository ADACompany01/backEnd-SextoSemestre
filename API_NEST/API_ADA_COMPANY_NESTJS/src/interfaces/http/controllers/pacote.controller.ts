import { Controller, Get, Post, Body, Param, Put, Delete, HttpStatus, Logger, HttpException, UseGuards } from '@nestjs/common';
import { CreatePacoteDto, TipoPacote } from '../dtos/requests/create-pacote.dto';
import { UpdatePacoteDto } from '../dtos/requests/update-pacote.dto';
import { PacoteResponseDto } from '../dtos/responses/pacote-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { FuncionarioGuard } from '../guards/funcionario.guard';
import { CreatePacoteUseCase } from '../../../application/use-cases/pacote/create-pacote.use-case';
import { ListPacotesUseCase } from '../../../application/use-cases/pacote/list-pacotes.use-case';
import { GetPacoteUseCase } from '../../../application/use-cases/pacote/get-pacote.use-case';
import { UpdatePacoteUseCase } from '../../../application/use-cases/pacote/update-pacote.use-case';
import { DeletePacoteUseCase } from '../../../application/use-cases/pacote/delete-pacote.use-case';
import { Pacote } from '../../../domain/models/pacote.model';

@ApiTags('pacotes')
@ApiBearerAuth()
@Controller('pacotes')
@UseGuards(FuncionarioGuard)
export class PacoteController {
  private readonly logger = new Logger(PacoteController.name);

  constructor(
    private readonly createPacoteUseCase: CreatePacoteUseCase,
    private readonly listPacotesUseCase: ListPacotesUseCase,
    private readonly getPacoteUseCase: GetPacoteUseCase,
    private readonly updatePacoteUseCase: UpdatePacoteUseCase,
    private readonly deletePacoteUseCase: DeletePacoteUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo pacote' })
  @ApiResponse({ status: 201, description: 'Pacote criado com sucesso', type: PacoteResponseDto })
  async create(@Body() createPacoteDto: CreatePacoteDto) {
    try {
      const pacoteModel = toPacoteModelFromCreateDto(createPacoteDto);
      const pacote = await this.createPacoteUseCase.execute(pacoteModel);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Pacote criado com sucesso',
        data: toPacoteResponseDto(pacote),
      };
    } catch (error) {
      this.logger.error(`Erro ao criar pacote: ${error.message}`, error.stack);
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Erro ao criar pacote: ${error.message}`,
        error: error.name,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os pacotes' })
  @ApiResponse({ status: 200, description: 'Lista de pacotes retornada com sucesso', type: PacoteResponseDto, isArray: true })
  async findAll() {
    try {
      const pacotes = await this.listPacotesUseCase.execute();
      return {
        statusCode: HttpStatus.OK,
        message: 'Pacotes encontrados com sucesso',
        data: toPacoteResponseDtoList(pacotes),
      };
    } catch (error) {
      this.logger.error(`Erro ao listar pacotes: ${error.message}`, error.stack);
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Erro ao listar pacotes: ${error.message}`,
        error: error.name,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar pacote por ID' })
  @ApiParam({ name: 'id', description: 'ID do pacote' })
  @ApiResponse({ status: 200, description: 'Pacote encontrado com sucesso', type: PacoteResponseDto })
  @ApiResponse({ status: 404, description: 'Pacote não encontrado' })
  async findOne(@Param('id') id: string) {
    const pacote = await this.getPacoteUseCase.execute(id);
    if (!pacote) {
      throw new HttpException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Pacote não encontrado',
      }, HttpStatus.NOT_FOUND);
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Pacote encontrado com sucesso',
      data: toPacoteResponseDto(pacote),
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar um pacote' })
  @ApiParam({ name: 'id', description: 'ID do pacote' })
  @ApiResponse({ status: 200, description: 'Pacote atualizado com sucesso', type: PacoteResponseDto })
  @ApiResponse({ status: 404, description: 'Pacote não encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updatePacoteDto: UpdatePacoteDto,
  ) {
    const pacoteModel = toPacoteModelFromUpdateDto(updatePacoteDto, id);
    const pacote = await this.updatePacoteUseCase.execute(id, pacoteModel);
    if (!pacote) {
      throw new HttpException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Pacote não encontrado',
      }, HttpStatus.NOT_FOUND);
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Pacote atualizado com sucesso',
      data: toPacoteResponseDto(pacote),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um pacote' })
  @ApiParam({ name: 'id', description: 'ID do pacote' })
  @ApiResponse({ status: 200, description: 'Pacote removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Pacote não encontrado' })
  async remove(@Param('id') id: string) {
    const deleted = await this.deletePacoteUseCase.execute(id);
    if (deleted === 0) {
      throw new HttpException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Pacote não encontrado',
      }, HttpStatus.NOT_FOUND);
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Pacote removido com sucesso',
    };
  }
}

function toPacoteModelFromCreateDto(dto: CreatePacoteDto): Pacote {
  return {
    id_cliente: dto.id_cliente,
    tipo_pacote: dto.tipo_pacote,
    valor_base: dto.valor_base,
  };
}

function toPacoteModelFromUpdateDto(dto: UpdatePacoteDto, id_pacote: string): Pacote {
  return {
    id_pacote,
    id_cliente: dto.id_cliente ?? '',
    tipo_pacote: dto.tipo_pacote ?? TipoPacote.A,
    valor_base: dto.valor_base ?? 0,
  };
}

function toPacoteResponseDto(pacote: Pacote): PacoteResponseDto {
  return {
    id_pacote: pacote.id_pacote,
    id_cliente: pacote.id_cliente,
    tipo_pacote: pacote.tipo_pacote as TipoPacote,
    valor_base: pacote.valor_base,
  };
}

function toPacoteResponseDtoList(pacotes: Pacote[]): PacoteResponseDto[] {
  return pacotes.map(toPacoteResponseDto);
} 