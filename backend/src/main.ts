import { randomUUID } from 'node:crypto';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3001')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.setGlobalPrefix('api');
  app.use(helmet());
  app.use(cookieParser());
  app.use((request: Request, response: Response, next: NextFunction) => {
    const requestId = request.header('x-request-id') ?? randomUUID();
    (request as Request & { requestId?: string }).requestId = requestId;
    response.setHeader('x-request-id', requestId);

    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      const origin = request.headers.origin;

      if (origin && !corsOrigins.includes(origin)) {
        response.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Origin tidak diizinkan.',
            request_id: requestId,
          },
        });
        return;
      }
    }

    next();
  });
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
