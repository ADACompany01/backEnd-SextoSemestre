import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        // As variáveis de ambiente do sistema (definidas pelo docker-compose) têm prioridade sobre .env
        // No Docker, o docker-compose define MONGODB_HOST=mongodb explicitamente
        const host = configService.get<string>('MONGODB_HOST') || 'localhost';
        const port = configService.get<string>('MONGODB_PORT') || '27017';
        const database = configService.get<string>('MONGODB_DATABASE') || 'adacompany';
        const username = configService.get<string>('MONGODB_USERNAME');
        const password = configService.get<string>('MONGODB_PASSWORD');

        // Construir URI do MongoDB
        let uri: string;
        if (configService.get<string>('MONGODB_URI')) {
          uri = configService.get<string>('MONGODB_URI')!;
        } else if (username && password) {
          // URI com autenticação
          uri = `mongodb://${username}:${encodeURIComponent(password)}@${host}:${port}/${database}?authSource=admin`;
        } else {
          // URI sem autenticação
          uri = `mongodb://${host}:${port}/${database}`;
        }

        console.log(`[MongoDB] Conectando a: ${uri.replace(/:[^:@]+@/, ':****@')}`); // Log sem senha
        console.log(`[MongoDB] Host: ${host}, Port: ${port}, Database: ${database}`);

        return {
          uri,
          retryWrites: true,
          w: 'majority',
          // Configurações de conexão para ambientes Docker
          serverSelectionTimeoutMS: 10000, // 10 segundos para selecionar servidor
          socketTimeoutMS: 45000, // 45 segundos de timeout no socket
          connectTimeoutMS: 10000, // 10 segundos para conectar
          // Retry automático
          retryReads: true,
          // Configurações para evitar problemas de conexão
          maxPoolSize: 10,
          minPoolSize: 1,
        };
      },
    }),
  ],
  exports: [MongooseModule],
})
export class MongoDBModule {}


