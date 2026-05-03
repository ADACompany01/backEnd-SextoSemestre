import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RequestWithUser } from '../interfaces/user.interface';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  use(req: RequestWithUser, res: Response, next: NextFunction) {
    const authHeader = (req.headers as any).authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token de autenticação não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const secret = this.configService.get<string>('JWT_SECRET') || '';
      const payload = this.jwtService.verify(token, { secret });
      req.user = payload as any;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token de autenticação inválido' });
    }
  }
} 