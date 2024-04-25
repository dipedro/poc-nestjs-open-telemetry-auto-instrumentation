import { Controller, Get, Post, Put } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('v1')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/teste')
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/teste')
  save(): string {
    return this.appService.getHello();
  }

  @Put('/teste')
  teste(): string {
    return this.appService.getHello();
  }
}
