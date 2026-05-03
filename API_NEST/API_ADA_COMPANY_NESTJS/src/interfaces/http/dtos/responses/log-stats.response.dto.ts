import { ApiProperty } from '@nestjs/swagger';

export class LogStatsResponseDto {
  @ApiProperty({ description: 'Total de logs' })
  total: number;

  @ApiProperty({ description: 'Contagem por nível', example: { error: 10, info: 50, warn: 5 } })
  byLevel: Record<string, number>;

  @ApiProperty({ description: 'Contagem por contexto', example: { auth: 20, api: 30, database: 15 } })
  byContext: Record<string, number>;
}
