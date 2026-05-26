import { Module } from '@nestjs/common';
import { ChatbotService } from '../application/services/chatbot.service';
import { ChatbotController } from '../interfaces/http/controllers/chatbot.controller';

@Module({
  controllers: [ChatbotController],
  providers: [ChatbotService],
})
export class ChatbotModule {}
