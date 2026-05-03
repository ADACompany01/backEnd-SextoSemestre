import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Usuario } from './entities/usuario.entity';
import { Cliente } from './entities/cliente.entity';
import { Funcionario } from './entities/funcionario.entity';
import { Orcamento } from './entities/orcamento.entity';
import { Contrato } from './entities/contrato.entity';
import { Pacote } from './entities/pacote.entity';
import { UsuarioRepository } from './repositories/usuario.repository';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'ada_company'),
        autoLoadModels: true,
        synchronize: true,
        models: [Usuario, Cliente, Funcionario, Orcamento, Contrato, Pacote],
      }),
    }),
    SequelizeModule.forFeature([Usuario, Cliente, Funcionario, Orcamento, Contrato, Pacote]),
  ],
  providers: [
    UsuarioRepository,
  ],
  exports: [
    UsuarioRepository,
    SequelizeModule.forFeature([Usuario, Cliente, Funcionario, Orcamento, Contrato, Pacote])
  ]
})
export class DatabaseModule {} 