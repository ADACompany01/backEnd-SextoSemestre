import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ChatbotMessageDto {
  @ApiPropertyOptional({
    example: 'inicio',
    description: 'No atual da arvore de decisao',
  })
  @IsOptional()
  @IsString()
  nodeId?: string;

  @ApiPropertyOptional({
    example: 'orcamento',
    description: 'Opcao escolhida pelo usuario dentro do no atual',
  })
  @IsOptional()
  @IsString()
  optionId?: string;
}
