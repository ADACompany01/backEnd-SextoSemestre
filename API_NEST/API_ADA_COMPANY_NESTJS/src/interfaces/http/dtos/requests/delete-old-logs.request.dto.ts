import { IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteOldLogsRequestDto {
  @ApiProperty({ description: 'Data limite - logs anteriores a esta data serão deletados (ISO string)' })
  @IsDateString()
  olderThan: string;
}
