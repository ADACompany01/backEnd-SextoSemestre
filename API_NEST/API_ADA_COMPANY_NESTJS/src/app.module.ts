import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { DatabaseModule } from './infrastructure/database/database.module';
import { DynamoDBModule } from './infrastructure/database/dynamodb.module';
import { MongoDBModule } from './infrastructure/database/mongodb.module';
import { AuthModule } from './application/auth/auth.module';
import { ClienteModule } from './modules/cliente.module';
import { FuncionarioModule } from './modules/funcionario.module';
import { OrcamentoModule } from './modules/orcamento.module';
import { ContratoModule } from './modules/contrato.module';
import { PacoteModule } from './modules/pacote.module';
import { SolicitacaoModule } from './modules/solicitacao.module';
import { LighthouseModule } from './modules/lighthouse.module';
import { LogModule } from './modules/log.module';
import { NotificacaoModule } from './modules/notificacao.module';
import { JwtAuthGuard } from './interfaces/http/guards/jwt-auth.guard';
import { CustomThrottlerGuard } from './interfaces/http/guards/custom-throttler.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Rate Limiting - Proteção contra força bruta e DDoS
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: 60000, // Time window em milissegundos (1 minuto)
            limit: 100, // Máximo de 100 requisições por minuto
          },
        ],
        // Usa armazenamento em memória por padrão (pode ser configurado para Redis em produção)
      }),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET não configurado no arquivo .env');
        }
        return {
          secret,
          signOptions: { expiresIn: '1h' },
        };
      },
      global: true,
    }),
    DatabaseModule,
    DynamoDBModule,
    MongoDBModule,
    AuthModule,
    ClienteModule,
    FuncionarioModule,
    OrcamentoModule,
    ContratoModule,
    PacoteModule,
    SolicitacaoModule,
    LighthouseModule,
    LogModule,
    NotificacaoModule,
  ],
  // controllers: [TestController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard, // Usa guard customizado que ignora OPTIONS
    },
  ],
})
export class AppModule {}
