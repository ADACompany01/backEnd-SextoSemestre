import { Injectable, UnauthorizedException, Logger, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { FuncionarioRepository } from '../../domain/repositories/funcionario.repository.interface';
import { GetClienteByEmailUseCase } from '../use-cases/cliente/get-cliente-by-email.use-case';
import { GetFuncionarioByEmailUseCase } from '../use-cases/funcionario/get-funcionario-by-email.use-case';
import { InjectModel } from '@nestjs/sequelize';
import { Usuario } from '../../infrastructure/database/entities/usuario.entity';
import { Cliente } from '../../infrastructure/database/entities/cliente.entity';
import { Funcionario } from '../../infrastructure/database/entities/funcionario.entity';
import { UsuarioRepository } from '../../infrastructure/database/repositories/usuario.repository';
import { FUNCIONARIO_REPOSITORY } from '../../infrastructure/providers/funcionario.provider';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(Usuario)
    private usuarioModel: typeof Usuario,
    @InjectModel(Cliente)
    private clienteModel: typeof Cliente,
    @InjectModel(Funcionario)
    private funcionarioModel: typeof Funcionario,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(FUNCIONARIO_REPOSITORY)
    private funcionarioRepository: FuncionarioRepository,
    private getClienteByEmailUseCase: GetClienteByEmailUseCase,
    private usuarioRepository: UsuarioRepository,
    private getFuncionarioByEmailUseCase: GetFuncionarioByEmailUseCase
  ) { }

  private getJwtSecret(): string {
    return process.env.NODE_ENV === 'test'
      ? 'test-secret-key'
      : this.configService.get<string>('JWT_SECRET');
  }

  gerarTokenValido(): string {
    const payload = { id_usuario: 123, tipo_usuario: 'admin' };
    const secret = this.configService.get<string>('JWT_SECRET');

    return this.jwtService.sign(payload, {
      secret: secret,
      expiresIn: '1h',
    });
  }

  async login({ email, senha }: { email: string; senha: string }) {
    const usuario = await this.usuarioRepository.findByEmail(email);
    const isPasswordValid = usuario && usuario.senha ? await bcrypt.compare(senha, usuario.senha) : false;
  
    if (!usuario || !isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
  
    // Se for funcionário, verifica se existe na tabela de funcionários
    if (usuario.tipo_usuario === 'funcionario') {
      try {
        const funcionario = await this.getFuncionarioByEmailUseCase.execute(email);
        if (!funcionario) {
          this.logger.warn(`Funcionário com email ${email} não encontrado na tabela de funcionários, mas existe na tabela de usuários`);
          // Não bloquear o login se o funcionário não estiver na tabela, mas registrar o aviso
        }
      } catch (error) {
        this.logger.error(`Erro ao verificar funcionário: ${error.message}`, error.stack);
        // Não bloquear o login por erros de busca na tabela de funcionários
      }
    }
  
    // Se for cliente, verifica se existe na tabela de clientes
    if (usuario.tipo_usuario === 'cliente') {
      try {
        const cliente = await this.getClienteByEmailUseCase.execute(email);
        if (!cliente) {
          this.logger.warn(`Cliente com email ${email} não encontrado na tabela de clientes, mas existe na tabela de usuários`);
          // Não bloquear o login se o cliente não estiver na tabela, mas registrar o aviso
        }
      } catch (error) {
        this.logger.error(`Erro ao verificar cliente: ${error.message}`, error.stack);
        // Não bloquear o login por erros de busca na tabela de clientes
      }
    }
  
    const payload = {
      id_usuario: String(usuario.id_usuario),
      email: usuario.email,
      tipo_usuario: usuario.tipo_usuario
    };
  
    return {
      token: this.jwtService.sign(payload, {
        secret: this.getJwtSecret(),
        expiresIn: '1h'
      }),
      user: {
        id: String(usuario.id_usuario),
        nome: usuario.nome_completo,
        email: usuario.email,
        tipo: usuario.tipo_usuario
      }
    };
  }

  async validateUser(payload: any) {
    const usuario = await this.usuarioRepository.findOne(payload.id_usuario);

    if (!usuario) {
      return null;
    }

    if (usuario.tipo_usuario === payload.tipo_usuario) {
      return {
        id_usuario: String(usuario.id_usuario),
        email: usuario.email,
        tipo_usuario: usuario.tipo_usuario,
        nome: usuario.nome_completo
      };
    }

    return null;
  }

  async register(data: { name: string; email: string; password: string; type?: string; phone?: string }) {
    try {
      this.logger.log(`[register] Iniciando registro para email: ${data.email}`);
      
      // SEGURANÇA: Bloquear cadastro de funcionários pelo endpoint público
      // Funcionários devem ser cadastrados apenas por administradores autenticados
      if (data.type === 'employee') {
        this.logger.warn(`[register] Tentativa de cadastro de funcionário bloqueada: ${data.email}`);
        throw new UnauthorizedException('Cadastro de funcionários não é permitido por este endpoint');
      }
      
      // Verificar se email já existe
      const existingUser = await this.usuarioRepository.findByEmail(data.email);
      if (existingUser) {
        this.logger.warn(`[register] Email já cadastrado: ${data.email}`);
        throw new UnauthorizedException('Email já cadastrado');
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Sempre criar como cliente (tipo padrão)
      const tipoUsuario = 'cliente';
      this.logger.log(`[register] Tipo de usuário: ${tipoUsuario}`);

      // Criar usuário
      const newUser = await this.usuarioModel.create({
        nome_completo: data.name,
        email: data.email,
        senha: hashedPassword,
        tipo_usuario: tipoUsuario,
        telefone: data.phone || '',
      });
      
      this.logger.log(`[register] Usuário criado com ID: ${newUser.id_usuario}`);

      // IMPORTANTE: Criar registro na tabela clientes (apenas clientes podem se cadastrar)
      this.logger.log(`[register] Criando registro de cliente...`);
      
      try {
        // Gerar CNPJ temporário único baseado no timestamp e id do usuário
        const timestamp = Date.now().toString().slice(-8);
        const cnpjTemporario = `${timestamp.slice(0, 2)}.${timestamp.slice(2, 5)}.${timestamp.slice(5, 8)}/${newUser.id_usuario.slice(0, 4)}-${timestamp.slice(-2)}`;
        
        this.logger.log(`[register] CNPJ temporário gerado: ${cnpjTemporario}`);
        
        const cliente = await this.clienteModel.create({
          nome_completo: data.name,
          email: data.email,
          telefone: data.phone || '',
          cnpj: cnpjTemporario,
          id_usuario: newUser.id_usuario,
        });
        
        this.logger.log(`[register] Cliente criado com sucesso - ID: ${cliente.id_cliente}`);
      } catch (clientError) {
        this.logger.error(`[register] Erro ao criar cliente:`, {
          message: clientError.message,
          name: clientError.name,
          errors: clientError.errors,
          stack: clientError.stack
        });
        
        // Reverter criação do usuário
        try {
          await this.usuarioModel.destroy({ where: { id_usuario: newUser.id_usuario } });
          this.logger.log(`[register] Rollback do usuário executado com sucesso`);
        } catch (rollbackError) {
          this.logger.error(`[register] Erro ao fazer rollback do usuário: ${rollbackError.message}`);
        }
        
        throw new UnauthorizedException(`Erro ao criar registro de cliente: ${clientError.message}`);
      }

      // Gerar token
      const payload = {
        id_usuario: String(newUser.id_usuario),
        email: newUser.email,
        tipo_usuario: newUser.tipo_usuario
      };

      const token = this.jwtService.sign(payload, {
        secret: this.getJwtSecret(),
        expiresIn: '1h'
      });

      this.logger.log(`[register] Registro completo com sucesso para: ${data.email}`);

      return {
        success: true,
        message: 'Usuário cadastrado com sucesso!',
        token,
        user: {
          id: String(newUser.id_usuario),
          nome: newUser.nome_completo,
          email: newUser.email,
          tipo: newUser.tipo_usuario
        }
      };
    } catch (error) {
      this.logger.error(`[register] Erro geral no registro: ${error.message}`, error.stack);
      
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      throw new UnauthorizedException(`Erro ao registrar usuário: ${error.message}`);
    }
  }
} 