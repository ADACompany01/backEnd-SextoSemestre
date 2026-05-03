import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from '../../interfaces/http/controllers/auth.controller';
import { GetClienteByEmailUseCase } from '../use-cases/cliente/get-cliente-by-email.use-case';
import { FuncionarioModule } from '../../modules/funcionario.module';
import { ClienteModule } from '../../modules/cliente.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { FuncionarioGuard } from '../../interfaces/http/guards/funcionario.guard';
import { SelfAccessGuard } from '../../interfaces/http/guards/self-access.guard';
import { FuncionarioRepositoryProvider, FUNCIONARIO_REPOSITORY } from '../../infrastructure/providers/funcionario.provider';
import { ClienteRepositoryProvider, CLIENTE_REPOSITORY } from '../../infrastructure/providers/cliente.provider';
import { UsuarioRepository } from '../../infrastructure/database/repositories/usuario.repository';
import { SequelizeModule } from '@nestjs/sequelize';
import { Usuario } from '../../infrastructure/database/entities/usuario.entity';
import { Funcionario as FuncionarioEntity } from '../../infrastructure/database/entities/funcionario.entity';
import { Cliente as ClienteEntity } from '../../infrastructure/database/entities/cliente.entity';
import { FuncionarioRepositoryImpl } from '../../infrastructure/database/repositories/funcionario.repository';
import { ClienteRepositoryImpl } from '../../infrastructure/database/repositories/cliente.repository';
import { LogModule } from '../../modules/log.module';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
    PassportModule,
    FuncionarioModule,
    ClienteModule,
    LogModule,
    SequelizeModule.forFeature([Usuario, FuncionarioEntity, ClienteEntity]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    FuncionarioGuard,
    SelfAccessGuard,
    GetClienteByEmailUseCase,
    {
      provide: FUNCIONARIO_REPOSITORY,
      useClass: FuncionarioRepositoryImpl,
    },
    {
      provide: CLIENTE_REPOSITORY,
      useClass: ClienteRepositoryImpl,
    },
    UsuarioRepository,
  ],
  exports: [
    AuthService,
    JwtStrategy,
    FuncionarioGuard,
    SelfAccessGuard,
    GetClienteByEmailUseCase,
    FUNCIONARIO_REPOSITORY,
    FuncionarioRepositoryProvider,
    CLIENTE_REPOSITORY,
    ClienteRepositoryProvider,
    UsuarioRepository,
  ],
})
export class AuthModule {} 