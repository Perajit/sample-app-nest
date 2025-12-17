import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { initializeTransactionalContext } from 'typeorm-transactional';
import * as cookieParser from 'cookie-parser';
import { RequestHandler } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  initializeTransactionalContext();

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use((cookieParser as () => RequestHandler)());

  const clientOrigin = configService.get<string>('app.clientOrigin');
  app.enableCors({
    origin: clientOrigin,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // start server
  const port = configService.get<number>('app.port')!;
  await app.listen(port);
}

bootstrap().catch((err) => {
  console.log('Application failed to start:', err);
});
