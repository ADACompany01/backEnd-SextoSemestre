import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpStatus, UseGuards, HttpException, Logger, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { CreateContratoDto, StatusContrato } from '../../../interfaces/http/dtos/requests/create-contrato.dto';
import { UpdateContratoDto } from '../../../interfaces/http/dtos/requests/update-contrato.dto';
import { SignContratoDto } from '../../../interfaces/http/dtos/requests/sign-contrato.dto';
import { ContratoResponseDto } from '../../../interfaces/http/dtos/responses/contrato-response.dto';
import { FuncionarioGuard } from '../guards/funcionario.guard';
import { CreateContratoUseCase } from '../../../application/use-cases/contrato/create-contrato.use-case';
import { ListContratosUseCase } from '../../../application/use-cases/contrato/list-contratos.use-case';
import { GetContratoUseCase } from '../../../application/use-cases/contrato/get-contrato.use-case';
import { UpdateContratoUseCase } from '../../../application/use-cases/contrato/update-contrato.use-case';
import { DeleteContratoUseCase } from '../../../application/use-cases/contrato/delete-contrato.use-case';
import { SignContratoUseCase } from '../../../application/use-cases/contrato/sign-contrato.use-case';
import { FileUploadService } from '../../../application/services/file-upload.service';
import { Contrato as ContratoModel } from '../../../domain/models/contrato.model';

@ApiTags('contratos')
@ApiBearerAuth()
@Controller('contratos')
@UseGuards(FuncionarioGuard)
export class ContratoController {
  private readonly logger = new Logger(ContratoController.name);

  constructor(
    private readonly createContratoUseCase: CreateContratoUseCase,
    private readonly listContratosUseCase: ListContratosUseCase,
    private readonly getContratoUseCase: GetContratoUseCase,
    private readonly updateContratoUseCase: UpdateContratoUseCase,
    private readonly deleteContratoUseCase: DeleteContratoUseCase,
    private readonly signContratoUseCase: SignContratoUseCase,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo contrato' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Contrato criado com sucesso',
    type: ContratoResponseDto 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Dados inválidos fornecidos' 
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'Já existe um contrato para este orçamento' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Token não fornecido ou inválido' 
  })
  async create(@Body() createContratoDto: CreateContratoDto) {
     try {
      const contrato = await this.createContratoUseCase.execute(createContratoDto);
      return this.toContratoResponseDto(contrato);
     } catch (error) {
        this.logger.error(`Erro ao criar contrato: ${error.message}`, error.stack);
        // Aqui você pode adicionar lógica para tratar erros específicos dos use-cases,
        // como BadRequestException ou ConflictException
        throw new HttpException({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Erro ao criar contrato: ${error.message}`,
          error: error.name,
        }, HttpStatus.INTERNAL_SERVER_ERROR);
     }
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os contratos' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lista de contratos retornada com sucesso',
    type: [ContratoResponseDto]
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Token não fornecido ou inválido' 
  })
  async findAll() {
     try {
      const contratos = await this.listContratosUseCase.execute();
      return contratos.map(contrato => this.toContratoResponseDto(contrato));
     } catch (error) {
        this.logger.error(`Erro ao listar contratos: ${error.message}`, error.stack);
        throw new HttpException({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Erro ao listar contratos: ${error.message}`,
          error: error.name,
        }, HttpStatus.INTERNAL_SERVER_ERROR);
     }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um contrato pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do contrato' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Contrato encontrado com sucesso',
    type: ContratoResponseDto 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Contrato não encontrado' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Token não fornecido ou inválido' 
  })
  async findOne(@Param('id') id: string) {
    try {
      const contrato = await this.getContratoUseCase.execute(id);
      if (!contrato) {
        throw new HttpException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Contrato não encontrado',
        }, HttpStatus.NOT_FOUND);
      }
      return this.toContratoResponseDto(contrato);
    } catch (error) {
       this.logger.error(`Erro ao buscar contrato por ID ${id}: ${error.message}`, error.stack);
        // Aqui você pode adicionar lógica para tratar erros específicos dos use-cases,
        // como NotFoundException
        throw new HttpException({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Erro ao buscar contrato: ${error.message}`,
          error: error.name,
        }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um contrato' })
  @ApiParam({ name: 'id', description: 'ID do contrato' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Contrato atualizado com sucesso',
    type: ContratoResponseDto 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Contrato não encontrado' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Dados inválidos fornecidos' 
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'Já existe um contrato para este orçamento' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Token não fornecido ou inválido' 
  })
  async update(
    @Param('id') id: string,
    @Body() updateContratoDto: UpdateContratoDto,
  ) {
    try {
      // Assumindo que o use-case de update retorna o contrato atualizado
      const updatedContrato = await this.updateContratoUseCase.execute(id, updateContratoDto);
      return this.toContratoResponseDto(updatedContrato);
    } catch (error) {
       this.logger.error(`Erro ao atualizar contrato com ID ${id}: ${error.message}`, error.stack);
       // Aqui você pode adicionar lógica para tratar erros específicos dos use-cases
        throw new HttpException({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Erro ao atualizar contrato: ${error.message}`,
          error: error.name,
        }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Fazer upload do PDF do contrato' })
  @ApiParam({ name: 'id', description: 'ID do contrato' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo PDF do contrato',
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
    description: 'Contrato não encontrado' 
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

      // Verificar se o contrato existe
      const contrato = await this.getContratoUseCase.execute(id);
      if (!contrato) {
        throw new HttpException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Contrato não encontrado',
        }, HttpStatus.NOT_FOUND);
      }

      // Salvar arquivo
      const filePath = await this.fileUploadService.savePDFFile(file, 'contrato', id);

      // Atualizar contrato com o caminho do arquivo
      await this.updateContratoUseCase.execute(id, { arquivo_contrato: filePath } as any);

      return {
        statusCode: HttpStatus.OK,
        message: 'Arquivo enviado com sucesso',
        filePath,
      };
    } catch (error) {
      this.logger.error(`Erro ao fazer upload do arquivo do contrato ${id}: ${error.message}`, error.stack);
      throw new HttpException({
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Erro ao fazer upload: ${error.message}`,
        error: error.name,
      }, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('sign')
  @ApiOperation({ summary: 'Assinar um contrato digitalmente' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Contrato assinado com sucesso',
    schema: {
      type: 'object',
      properties: {
        signedContractPath: { type: 'string' },
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Dados inválidos fornecidos' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Contrato não encontrado' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Token não fornecido ou inválido' 
  })
  async sign(@Body() signContratoDto: SignContratoDto) {
    try {
      const result = await this.signContratoUseCase.execute(
        signContratoDto.contrato_id,
        signContratoDto.signature,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Contrato assinado com sucesso',
        signedContractPath: result.signedContractPath,
      };
    } catch (error) {
      this.logger.error(`Erro ao assinar contrato: ${error.message}`, error.stack);
      throw new HttpException({
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Erro ao assinar contrato: ${error.message}`,
        error: error.name,
      }, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um contrato' })
  @ApiParam({ name: 'id', description: 'ID do contrato' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Contrato removido com sucesso' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Contrato não encontrado' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Token não fornecido ou inválido' 
  })
  async remove(@Param('id') id: string) {
     try {
      await this.deleteContratoUseCase.execute(id);
      return { 
        statusCode: HttpStatus.OK,
        message: 'Contrato removido com sucesso' 
      };
     } catch (error) {
       this.logger.error(`Erro ao remover contrato com ID ${id}: ${error.message}`, error.stack);
        // Aqui você pode adicionar lógica para tratar erros específicos dos use-cases,
        // como NotFoundException
        throw new HttpException({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Erro ao remover contrato: ${error.message}`,
          error: error.name,
        }, HttpStatus.INTERNAL_SERVER_ERROR);
     }
  }

   private toContratoResponseDto(contrato: ContratoModel): ContratoResponseDto {
    return {
      id_contrato: contrato.id_contrato,
      id_cliente: (contrato as any).id_cliente,
      valor_contrato: contrato.valor_contrato,
      cod_orcamento: contrato.cod_orcamento,
      status_contrato: contrato.status_contrato as StatusContrato,
      data_inicio: contrato.data_inicio,
      data_entrega: contrato.data_entrega,
      cliente: (contrato as any).cliente,
      orcamento: (contrato as any).orcamento,
      arquivo_contrato: (contrato as any).arquivo_contrato,
      contrato_assinado_url: (contrato as any).contrato_assinado_url,
    };
  }
} 