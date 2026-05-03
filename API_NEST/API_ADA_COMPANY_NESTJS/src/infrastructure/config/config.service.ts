import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  get jwtConfig() {
    return {
      secret: this.configService.get<string>('JWT_SECRET') || 'defaultSecretKey',
      expiresIn: '1h',
    };
  }

  get databaseConfig() {
    return {
      host: this.configService.get<string>('DB_HOST') || 'localhost',
      port: this.configService.get<number>('DB_PORT') || 5432,
      username: this.configService.get<string>('DB_USERNAME') || 'postgres',
      password: this.configService.get<string>('DB_PASSWORD') || 'postgres',
      database: this.configService.get<string>('DB_DATABASE') || 'ada_company',
    };
  }
}