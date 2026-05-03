import { Module } from '@nestjs/common';
import { LighthouseService } from '../infrastructure/providers/lighthouse.service';
import { LighthouseController } from '../interfaces/http/controllers/lighthouse.controller';

@Module({
  controllers: [LighthouseController],
  providers: [LighthouseService],
})
export class LighthouseModule {} 