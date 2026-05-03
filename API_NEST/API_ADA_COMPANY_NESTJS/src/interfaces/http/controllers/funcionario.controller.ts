import { Controller, Get, Post, Body, Param, Put, Delete, HttpStatus, Logger, HttpException, UseGuards } from '@nestjs/common';
import { Public } from '../../http/decorators/public.decorator';
import { CreateFuncionarioDto } from '../dtos/requests/create-funcionario.dto';
import { UpdateFuncionarioDto } from '../dtos/requests/update-funcionario.dto';
import { FuncionarioResponseDto } from '../dtos/responses/funcionario-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { FuncionarioGuard } from '../guards/funcionario.guard';
import { SelfAccessGuard } from '../guards/self-access.guard';
import { CreateFuncionarioUseCase } from '../../../application/use-cases/funcionario/create-funcionario.use-case';
import { ListFuncionariosUseCase } from '../../../application/use-cases/funcionario/list-funcionarios.use-case';
import { GetFuncionarioUseCase } from '../../../application/use-cases/funcionario/get-funcionario.use-case';
import { GetFuncionarioByEmailUseCase } from '../../../application/use-cases/funcionario/get-funcionario-by-email.use-case';
import { UpdateFuncionarioUseCase } from '../../../application/use-cases/funcionario/update-funcionario.use-case';
import { DeleteFuncionarioUseCase } from '../../../application/use-cases/funcionario/delete-funcionario.use-case';
import { Funcionario } from '../../../domain/models/funcionario.model';
import { UsuarioRepository } from '../../../infrastructure/database/repositories/usuario.repository';
import { Usuario } from '../../../domain/models/usuario.model';
import { Usuario as UsuarioEntity } from '../../../infrastructure/database/entities/usuario.entity';

@ApiTags('funcionarios')
@ApiBearerAuth()
@Controller('funcionarios')
export class FuncionarioController {
  private readonly logger = new Logger(FuncionarioController.name);

  constructor(
    private readonly createFuncionarioUseCase: CreateFuncionarioUseCase,
    private readonly listFuncionariosUseCase: ListFuncionariosUseCase,
    private readonly getFuncionarioUseCase: GetFuncionarioUseCase,
    private readonly getFuncionarioByEmailUseCase: GetFuncionarioByEmailUseCase,
    private readonly updateFuncionarioUseCase: UpdateFuncionarioUseCase,
    private readonly deleteFuncionarioUseCase: DeleteFuncionarioUseCase,
    private readonly usuarioRepository: UsuarioRepository,
  ) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Criar um novo funcionário' })
  @ApiResponse({ status: 201, description: 'Funcionário criado com sucesso', type: FuncionarioResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async create(@Body() createFuncionarioDto: CreateFuncionarioDto) {
    try {
      const funcionario = await this.createFuncionarioUseCase.execute(createFuncionarioDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Funcionário criado com sucesso',
        data: this.toFuncionarioResponseDto(funcionario),
      };
    } catch (error) {
      this.logger.error(`Erro ao criar funcionário: ${error.message}`, error.stack);
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Erro ao criar funcionário: ${error.message}`,
        error: error.name,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(FuncionarioGuard)
  @Get()
  @ApiOperation({ summary: 'Listar todos os funcionários' })
  @ApiResponse({ status: 200, description: 'Lista de funcionários retornada com sucesso', type: FuncionarioResponseDto, isArray: true })
  async findAll() {
    const funcionarios = await this.listFuncionariosUseCase.execute();
    return {
      statusCode: HttpStatus.OK,
      message: 'Funcionários encontrados com sucesso',
      data: funcionarios.map(this.toFuncionarioResponseDto),
    };
  }

  @UseGuards(FuncionarioGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Buscar funcionário por ID' })
  @ApiParam({ name: 'id', description: 'ID do funcionário' })
  @ApiResponse({ status: 200, description: 'Funcionário encontrado com sucesso', type: FuncionarioResponseDto })
  @ApiResponse({ status: 404, description: 'Funcionário não encontrado' })
  async findOne(@Param('id') id: string) {
    const funcionario = await this.getFuncionarioUseCase.execute(id);
    if (!funcionario) {
      throw new HttpException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Funcionário não encontrado',
      }, HttpStatus.NOT_FOUND);
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Funcionário encontrado com sucesso',
      data: this.toFuncionarioResponseDto(funcionario),
    };
  }

  @UseGuards(FuncionarioGuard, SelfAccessGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Atualizar um funcionário' })
  @ApiParam({ name: 'id', description: 'ID do funcionário' })
  @ApiResponse({ status: 200, description: 'Funcionário atualizado com sucesso', type: FuncionarioResponseDto })
  @ApiResponse({ status: 404, description: 'Funcionário não encontrado' })
  async update(@Param('id') id: string, @Body() updateFuncionarioDto: UpdateFuncionarioDto) {
    try {
      const funcionario = await this.updateFuncionarioUseCase.execute(id, updateFuncionarioDto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Funcionário atualizado com sucesso',
        data: this.toFuncionarioResponseDto(funcionario),
      };
    } catch (error) {
      this.logger.error(`Erro ao atualizar funcionário: ${error.message}`, error.stack);
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Erro ao atualizar funcionário: ${error.message}`,
        error: error.name,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(FuncionarioGuard, SelfAccessGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Remover um funcionário' })
  @ApiParam({ name: 'id', description: 'ID do funcionário' })
  @ApiResponse({ status: 200, description: 'Funcionário removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Funcionário não encontrado' })
  async remove(@Param('id') id: string) {
    try {
      await this.deleteFuncionarioUseCase.execute(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Funcionário removido com sucesso',
      };
    } catch (error) {
      this.logger.error(`Erro ao remover funcionário: ${error.message}`, error.stack);
      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Erro ao remover funcionário: ${error.message}`,
        error: error.name,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Get funcionario by email' })
  @ApiParam({ name: 'email', description: 'Email of the funcionario' })
  @ApiResponse({ status: 200, description: 'Returns the funcionario', type: FuncionarioResponseDto })
  @ApiResponse({ status: 404, description: 'Funcionario not found' })
  async findByEmail(@Param('email') email: string): Promise<Funcionario> {
    const funcionario = await this.getFuncionarioByEmailUseCase.execute(email);
    if (!funcionario) {
      throw new HttpException('Funcionario not found', HttpStatus.NOT_FOUND);
    }
    return funcionario;
  }

  private toFuncionarioResponseDto(funcionario: any): FuncionarioResponseDto {
    return {
      id_funcionario: funcionario.id_funcionario,
      nome_completo: funcionario.nome_completo,
      email: funcionario.email,
      telefone: funcionario.telefone,
      id_usuario: funcionario.id_usuario,
      usuario: funcionario.usuario ? {
        id_usuario: funcionario.usuario.id_usuario,
        nome_completo: funcionario.usuario.nome_completo,
        email: funcionario.usuario.email,
        telefone: funcionario.usuario.telefone,
      } : undefined,
    };
  }
}