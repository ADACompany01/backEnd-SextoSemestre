import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChatbotService } from '../../../application/services/chatbot.service';
import { Public } from '../decorators/public.decorator';
import { ChatbotMessageDto } from '../dtos/requests/chatbot-message.dto';

@ApiTags('chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Public()
  @Get('tree')
  @ApiOperation({ summary: 'Retornar a arvore de decisao do chatbot' })
  @ApiResponse({ status: 200, description: 'Arvore retornada com sucesso' })
  getTree() {
    return {
      statusCode: 200,
      message: 'Arvore do chatbot retornada com sucesso',
      data: this.chatbotService.getTree(),
    };
  }

  @Public()
  @Post('message')
  @ApiOperation({ summary: 'Processar uma escolha do chatbot' })
  @ApiResponse({
    status: 200,
    description: 'Resposta do chatbot retornada com sucesso',
  })
  reply(@Body() chatbotMessageDto: ChatbotMessageDto) {
    return {
      statusCode: 200,
      message: 'Resposta do chatbot retornada com sucesso',
      data: this.chatbotService.reply(
        chatbotMessageDto.nodeId,
        chatbotMessageDto.optionId,
      ),
    };
  }
}
