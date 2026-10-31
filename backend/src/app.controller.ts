import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from './common/response/response';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  health() {
    return new Response({ status: 'ok' });
  }
}
