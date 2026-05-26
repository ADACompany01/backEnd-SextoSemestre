import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class ChatbotHistoryMessageDto {
  @ApiProperty({
    example: 'user',
    description: 'Autor da mensagem no historico',
  })
  @IsString()
  author: string;

  @ApiProperty({
    example: 'Quero saber sobre acessibilidade',
    description: 'Texto da mensagem no historico',
  })
  @IsString()
  @MaxLength(1000)
  text: string;
}

export class ChatbotLlmMessageDto {
  @ApiProperty({
    example: 'Preciso de ajuda para criar um site acessivel',
    description: 'Mensagem livre enviada pelo cliente para a Ada',
  })
  @IsString()
  @MaxLength(1200)
  message: string;

  @ApiPropertyOptional({
    example: 'Falar com Atendente',
    description: 'Contexto da arvore de decisao que abriu a conversa livre',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  contextTitle?: string;

  @ApiPropertyOptional({
    type: [ChatbotHistoryMessageDto],
    description: 'Historico recente da conversa para manter contexto',
  })
  @IsOptional()
  @IsArray()
  history?: ChatbotHistoryMessageDto[];
}
