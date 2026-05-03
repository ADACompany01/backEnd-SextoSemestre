import { Controller, Get, Post, Body, Param, Put, Delete, HttpStatus, Logger, HttpException, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateOrcamentoDto } from '../../../interfaces/http/dtos/requests/create-orcamento.dto';
import { UpdateOrcamentoDto } from '../../../interfaces/http/dtos/requests/update-orcamento.dto';
import { OrcamentoResponseDto } from '../../../interfaces/http/dtos/responses/orcamento-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FuncionarioGuard } from '../guards/funcionario.guard';
import { CreateOrcamentoUseCase } from '../../../application/use-cases/orcamento/create-orcamento.use-case';
import { ListOrcamentosUseCase } from '../../../application/use-cases/orcamento/list-orcamentos.use-case';
import { GetOrcamentoUseCase } from '../../../application/use-cases/orcamento/get-orcamento.use-case';
import { UpdateOrcamentoUseCase } from '../../../application/use-cases/orcamento/update-orcamento.use-case';
import { DeleteOrcamentoUseCase } from '../../../application/use-cases/orcamento/delete-orcamento.use-case';
import { FileUploadService } from '../../../application/services/file-upload.service';
import { Orcamento as OrcamentoModel } from '../../../domain/models/orcamento.model';
import { NotFoundException, ConflictException } from '@nestjs/common';

@ApiTags('orcamentos')
@ApiBearerAuth()
@Controller('orcamentos')
@UseGuards(FuncionarioGuard)
export class OrcamentoController {
  private readonly logger = new Logger(OrcamentoController.name);

  constructor(
    private readonly createOrcamentoUseCase: CreateOrcamentoUseCase,
    private readonly listOrcamentosUseCase: ListOrcamentosUseCase,
    private readonly getOrcamentoUseCase: GetOrcamentoUseCase,
    private readonly updateOrcamentoUseCase: UpdateOrcamentoUseCase,
    private readonly deleteOrcamentoUseCase: DeleteOrcamentoUseCase,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo orçamento' })
  @ApiBody({
    type: CreateOrcamentoDto,
    description: 'Dados para criar um novo orçamento',
    examples: {
      example1: {
        summary: 'Exemplo de criação de orçamento',
        value: {
          valor_orcamento: 2000.00,
          data_orcamento: '2023-10-26T10:00:00Z',
          data_validade: '2023-11-26T10:00:00Z',
          id_pacote: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
    },
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Orçamento criado com sucesso',
    type: OrcamentoResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Pacote não encontrado'
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Já existe orçamento para este pacote'
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Erro interno do servidor'
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Token não fornecido ou inválido' 
  })
  async create(@Body() createOrcamentoDto: CreateOrcamentoDto) {
    try {
      const orcamento = await this.createOrcamentoUseCase.execute(createOrcamentoDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Orçamento criado com sucesso',
        data: orcamento,
      };
    } catch (error) {
      this.logger.error(`Erro ao criar orçamento: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw new HttpException({ statusCode: HttpStatus.NOT_FOUND, message: error.message }, HttpStatus.NOT_FOUND);
      } else if (error instanceof ConflictException) {
        throw new HttpException({ statusCode: HttpStatus.CONFLICT, message: error.message }, HttpStatus.CONFLICT);
      } else {
        throw new HttpException({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Erro ao criar orçamento: ${error.message}`,
          error: error.name,
        }, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os orçamentos' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de orçamentos retornada com sucesso',
    type: OrcamentoResponseDto,
    isArray: true
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Token não fornecido ou inválido' 
  })
  async findAll() {
    try {
      const orcamentos = await this.listOrcamentosUseCase.execute();
      return {
        statusCode: HttpStatus.OK,
        message: 'Orçamentos encontrados com sucesso',
        data: orcamentos.map(orcamento => this.toOrcamentoResponseDto(orcamento)),
      };
    } catch (error) {
      this.logger.error(`Erro ao listar orçamentos: ${error.message}`, error.stack);
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Erro ao listar orçamentos: ${error.message}`,
        error: error.name,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar orçamento por ID' })
  @ApiParam({ name: 'id', description: 'ID do orçamento' })
  @ApiResponse({ 
    status: 200, 
    description: 'Orçamento encontrado com sucesso',
    type: OrcamentoResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Orçamento não encontrado'
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Token não fornecido ou inválido' 
  })
  async findOne(@Param('id') id: string) {
    try {
      const orcamento = await this.getOrcamentoUseCase.execute(id);
      if (!orcamento) {
        throw new HttpException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Orçamento não encontrado',
        }, HttpStatus.NOT_FOUND);
      }
      return this.toOrcamentoResponseDto(orcamento);
    } catch (error) {
       this.logger.error(`Erro ao buscar orçamento por ID ${id}: ${error.message}`, error.stack);
        // Aqui você pode adicionar lógica para tratar erros específicos dos use-cases,
        // como NotFoundException
        throw new HttpException({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Erro ao buscar orçamento: ${error.message}`,
          error: error.name,
        }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar um orçamento' })
  @ApiParam({ name: 'id', description: 'ID do orçamento' })
  @ApiResponse({ 
    status: 200, 
    description: 'Orçamento atualizado com sucesso',
    type: OrcamentoResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Orçamento não encontrado'
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Token não fornecido ou inválido' 
  })
  async update(
    @Param('id') id: string,
    @Body() updateOrcamentoDto: UpdateOrcamentoDto,
  ) {
    try {
      const [affectedCount, affectedRows] = await this.updateOrcamentoUseCase.execute(id, updateOrcamentoDto);

      if (affectedCount === 0) {
        throw new HttpException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Orçamento não encontrado para atualização',
        }, HttpStatus.NOT_FOUND);
      }

      // Retorna o orçamento atualizado. Assumindo que affectedRows contém o orçamento atualizado.
      // Se o use-case de update retornar apenas affectedCount, você precisaria buscar o orçamento novamente
      const updatedOrcamento = affectedRows[0];
      return this.toOrcamentoResponseDto(updatedOrcamento);

    } catch (error) {
       this.logger.error(`Erro ao atualizar orçamento com ID ${id}: ${error.message}`, error.stack);
       // Aqui você pode adicionar lógica para tratar erros específicos dos use-cases
        throw new HttpException({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Erro ao atualizar orçamento: ${error.message}`,
          error: error.name,
        }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/upload')
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Fazer upload do PDF do orçamento' })
  @ApiParam({ name: 'id', description: 'ID do orçamento' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo PDF do orçamento',
        },
      },
    },
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Arquivo enviado com sucesso',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
        filePath: { type: 'string' },
      },
    },
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Arquivo inválido ou não fornecido' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Orçamento não encontrado' 
  })
  async uploadFile(
    @Param('id') id: string,
    @UploadedFile() file: any,
  ) {
    try {
      if (!file) {
        throw new HttpException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Arquivo não fornecido',
        }, HttpStatus.BAD_REQUEST);
      }

      // Verificar se o orçamento existe
      const orcamento = await this.getOrcamentoUseCase.execute(id);
      if (!orcamento) {
        throw new HttpException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Orçamento não encontrado',
        }, HttpStatus.NOT_FOUND);
      }

      // Salvar arquivo
      const filePath = await this.fileUploadService.savePDFFile(file, 'orcamento', id);

      // Atualizar orçamento com o caminho do arquivo
      await this.updateOrcamentoUseCase.execute(id, { arquivo_orcamento: filePath });

      return {
        statusCode: HttpStatus.OK,
        message: 'Arquivo enviado com sucesso',
        filePath,
      };
    } catch (error) {
      this.logger.error(`Erro ao fazer upload do arquivo do orçamento ${id}: ${error.message}`, error.stack);
      throw new HttpException({
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Erro ao fazer upload: ${error.message}`,
        error: error.name,
      }, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um orçamento' })
  @ApiParam({ name: 'id', description: 'ID do orçamento' })
  @ApiResponse({ 
    status: 200, 
    description: 'Orçamento removido com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Orçamento não encontrado'
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Token não fornecido ou inválido' 
  })
  async remove(@Param('id') id: string) {
     try {
      await this.deleteOrcamentoUseCase.execute(id);
      return { 
        statusCode: HttpStatus.OK,
        message: 'Orçamento removido com sucesso' 
      };
     } catch (error) {
       this.logger.error(`Erro ao remover orçamento com ID ${id}: ${error.message}`, error.stack);
        // Aqui você pode adicionar lógica para tratar erros específicos dos use-cases,
        // como NotFoundException
        throw new HttpException({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Erro ao remover orçamento: ${error.message}`,
          error: error.name,
        }, HttpStatus.INTERNAL_SERVER_ERROR);
     }
  }

  private toOrcamentoResponseDto(orcamento: OrcamentoModel): OrcamentoResponseDto {
    return {
      cod_orcamento: orcamento.cod_orcamento,
      valor_orcamento: orcamento.valor_orcamento,
      data_orcamento: orcamento.data_orcamento,
      data_validade: orcamento.data_validade,
      id_pacote: orcamento.id_pacote,
      id_cliente: (orcamento as any).id_cliente,
      pacote: (orcamento as any).pacote,
      cliente: (orcamento as any).cliente,
      arquivo_orcamento: (orcamento as any).arquivo_orcamento,
    };
  }
}