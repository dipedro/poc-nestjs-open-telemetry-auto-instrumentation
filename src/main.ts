import { otelSDK } from './registerInstrumentation';
otelSDK.start();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpFilterException } from './global';

async function bootstrap() { 
  const app = await NestFactory.create(AppModule);

  // Add global exception filter to handle all exceptions and send data to opentelemetry
  app.useGlobalFilters(new HttpFilterException());

  await app.listen(process.env.PORT);
}
bootstrap();
