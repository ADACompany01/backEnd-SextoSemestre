import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './interfaces/http/interceptors/logging.interceptor';
import { LoggingExceptionFilter } from './interfaces/http/filters/logging-exception.filter';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const port = 3001;
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const isDevelopment = configService.get<string>('NODE_ENV') !== 'production';

  // Configuração segura do CORS - IMPORTANTE: configurar ANTES do Helmet
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8081',
    'https://newadacompany.vercel.app',
    'https://adacompany.duckdns.org',
    'http://adacompany.duckdns.org',
  ];

  // Adicionar IPs locais apenas em desenvolvimento
  if (isDevelopment) {
    allowedOrigins.push(
      'http://192.168.1.7:3000',
      'http://192.168.1.7:8081',
      'http://192.168.50.58:3000',
      'http://192.168.50.58:8081',
    );
  }

  // Configuração do CORS - DEVE VIR ANTES DO HELMET para não ser bloqueado
  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requisições sem origem (ex: mobile apps, Postman, curl)
      if (!origin) {
        return callback(null, true);
      }
      
      // Verificar se a origem está na lista permitida
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Em desenvolvimento, ser mais permissivo
      if (isDevelopment) {
        console.warn(`⚠️  CORS: Origem não autorizada em desenvolvimento: ${origin}`);
        return callback(null, true); // Permitir em desenvolvimento
      }
      
      // Em produção, bloquear origens não autorizadas
      console.error(`❌ CORS: Origem bloqueada: ${origin}`);
      return callback(new Error('Não permitido pelo CORS'));
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400, // Cache preflight por 24 horas
  });

  // Configuração do Helmet para headers de segurança HTTP
  // CSP desabilitado para não interferir com CORS - pode ser reativado depois com configuração adequada
  app.use(helmet({
    contentSecurityPolicy: false, // Desabilitado para não bloquear CORS - pode ser reconfigurado depois
    crossOriginEmbedderPolicy: false, // Permite carregar recursos externos quando necessário
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Permite recursos cross-origin
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }));
  
  // Configurar limite de tamanho para uploads (50MB)
  app.use(require('express').json({ limit: '50mb' }));
  app.use(require('express').urlencoded({ limit: '50mb', extended: true }));

  // Servir arquivos estáticos da pasta uploads
  const express = require('express');
  app.use('/uploads', express.static('uploads'));

  // Configurar prefixo global para todas as rotas
  app.setGlobalPrefix('api');

  // Adicionar ValidationPipe global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Adicionar interceptors e filtros globais para logging
  // TEMPORARIAMENTE DESABILITADO - LoggingInterceptor precisa ser configurado como provider
  // app.useGlobalInterceptors(app.get(LoggingInterceptor));
  // app.useGlobalFilters(app.get(LoggingExceptionFilter));
  
  // Configuração do Swagger - apenas em ambiente de desenvolvimento
  // IMPORTANTE: O Swagger deve ser configurado DEPOIS do setGlobalPrefix para incluir o prefixo
  if (isDevelopment) {
    const config = new DocumentBuilder()
      .setTitle('API ADA Company - Mobile Backend')
      .setDescription('API para gerenciamento de serviços da ADA Company (Backend Mobile - Porta 3001)\n\n**IMPORTANTE:** Todas as rotas têm o prefixo `/api`. Exemplo: `/api/funcionarios`')
      .setVersion('1.0')
      .addServer('https://adacompany.duckdns.org/api', 'Produção')
      .addServer('http://localhost:3001/api', 'Local')
      .addTag('auth', 'Endpoints de autenticação')
      .addTag('clientes', 'Gerenciamento de clientes')
      .addTag('funcionarios', 'Gerenciamento de funcionários')
      .addTag('pacotes', 'Gerenciamento de pacotes')
      .addTag('orcamentos', 'Gerenciamento de orçamentos')
      .addTag('contratos', 'Gerenciamento de contratos')
      .addTag('solicitacoes', 'Gerenciamento de solicitações')
      .addTag('mobile/lighthouse', 'Avaliação de acessibilidade (Lighthouse)')
      .addTag('logs', 'Sistema de logs da aplicação')
      .addTag('notificacoes', 'Sistema de notificações')
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Digite o token JWT obtido no endpoint de login',
        in: 'header',
      })
      .build();
      
      const document = SwaggerModule.createDocument(app, config, {
        operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
        ignoreGlobalPrefix: true, // CRÍTICO: false para incluir o prefixo /api nas rotas
      });
    
    // Swagger será acessível em /api (documentação) e as rotas já incluirão /api automaticamente
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        defaultModelsExpandDepth: 2,
        defaultModelExpandDepth: 2,
      },
      customSiteTitle: 'API ADA Company - Documentação',
    });
    console.log(`⚠️  Swagger disponível apenas em desenvolvimento: http://localhost:${port}/api`);
  } else {
    console.log('🔒 Swagger desabilitado em produção por segurança');
  }
  
  await app.listen(port, '0.0.0.0');  // Escuta em todas as interfaces de rede
  
  console.log(`✅ Aplicação rodando na porta ${port}`);
  if (isDevelopment) {
    console.log(`📚 Documentação Swagger disponível em: http://localhost:${port}/api`);
    console.log(`🌐 Acessível via rede local em: http://192.168.1.7:${port}/api`);
  } else {
    console.log(`🔒 Modo produção: Swagger desabilitado`);
  }
}
bootstrap();
