import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../common/decorators/public.decorator';
import { Response } from '../common/response/response';
import { ChatService } from './chat.service';
import { ChatMessageRequestDto } from './dto/chat-message.dto';

@Public()
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('status')
  getStatus() {
    const data = this.chatService.getStatus();
    return new Response({ data });
  }

  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('messages')
  @HttpCode(HttpStatus.OK)
  async sendMessage(@Body() dto: ChatMessageRequestDto) {
    const data = await this.chatService.sendMessage(dto);
    return new Response({ data });
  }
}
