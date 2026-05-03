import { Controller, Get, Post, Body, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { AuthService } from '../../../application/auth/auth.service';
import { Public } from '../decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthResponseDto } from '../dtos/responses/auth-response.dto';
import { LoggingService } from '../../../application/services/logging.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject('LoggingService')
    private readonly loggingService: LoggingService,
  ) {}

  @ApiOperation({ summary: 'Gerar token para teste' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token gerado com sucesso',
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
      }
    }
  })
  @Public()
  @Get('token')
  getToken(): { token: string } {
    const token = this.authService.gerarTokenValido();
    return { token };
  }

  @ApiOperation({ summary: 'Login de usuário (cliente ou funcionário)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'usuario@email.com' },
        senha: { type: 'string', example: 'senha123' }
      },
      required: ['email', 'senha']
    },
    description: 'Credenciais do usuário (cliente ou funcionário)'
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    type: AuthResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas'
  })
  @Public()
  @Post('login')
  @HttpCode(200)
  async login(@Body() body: { email: string; senha: string }) {
    try {
      const result = await this.authService.login(body);
      
      // Log de login bem-sucedido
      await this.loggingService.info(
        `Login realizado com sucesso para o email: ${body.email}`,
        'AuthController',
        { email: body.email, userId: result.user?.id }
      );
      
      return result;
    } catch (error) {
      // Log de tentativa de login falhada
      await this.loggingService.warn(
        `Tentativa de login falhada para o email: ${body.email}`,
        'AuthController',
        { email: body.email, error: error.message }
      );
      
      throw error;
    }
  }

  @ApiOperation({ summary: 'Registrar novo cliente (apenas clientes podem se cadastrar)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'João Silva' },
        email: { type: 'string', example: 'joao@example.com' },
        password: { type: 'string', example: 'senha123' },
        type: { type: 'string', enum: ['client'], example: 'client', description: 'Apenas "client" é permitido. Funcionários não podem se cadastrar por este endpoint.' },
        phone: { type: 'string', example: '(11) 99999-9999' }
      },
      required: ['name', 'email', 'password']
    },
    description: 'Dados do cliente. Funcionários devem ser cadastrados apenas por administradores autenticados.'
  })
  @ApiResponse({
    status: 201,
    description: 'Cliente registrado com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Tentativa de cadastrar funcionário ou email já cadastrado'
  })
  @ApiResponse({
    status: 409,
    description: 'Email já cadastrado'
  })
  @Public()
  @Post('register')
  @HttpCode(201)
  async register(@Body() body: { name: string; email: string; password: string; type?: string; phone?: string }) {
    try {
      const result = await this.authService.register(body);
      
      await this.loggingService.info(
        `Novo usuário registrado: ${body.email}`,
        'AuthController',
        { email: body.email, type: body.type }
      );
      
      return result;
    } catch (error) {
      await this.loggingService.warn(
        `Falha ao registrar usuário: ${body.email}`,
        'AuthController',
        { email: body.email, error: error.message }
      );
      
      throw error;
    }
  }
} 