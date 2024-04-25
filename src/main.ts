import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { otelSDK } from './registerInstrumentation';

async function bootstrap() {
  // Start SDK before nestjs factory create
  otelSDK.start();
  
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
