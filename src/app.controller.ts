import { Controller, Get, Post, Put } from '@nestjs/common';
import { api } from '@opentelemetry/sdk-node';
import { Pool } from 'pg';
import { AppService } from './app.service';
@Controller('v1')
export class AppController {
  constructor(
    private readonly appService: AppService
  ) {}


  @Get('/jedi2')
  async getHello() {
      console.log(process.env.PORT)
      const span = api.trace.getTracer('jedi2').startSpan('tantofaz');
      
      api.context.with(api.trace.setSpan(api.context.active(), span), () => {
        span.addEvent('invoking main()');
        span.setAttribute('foo', 'bar');
        span.end();
      });

      await new Promise(r => setTimeout(r, 1000));

      const pool = new Pool({
        user: process.env.PG_USER,
        host: process.env.PG_HOST,
        database: process.env.PG_DATABASE,
        password: process.env.PG_PASSWORD,
        port: parseInt(process.env.PG_PORT),
      });

      const { rows } = await pool.query('SELECT * FROM jedi');
      return rows;     

  }

  @Post('/teste')
  testePost(): string {
    return this.appService.getHello();
  }

  @Put('/teste')
  testePut(): string {
    return this.appService.getHello();
  }
}
