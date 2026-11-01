import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { setupSwagger } from './setup-swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3001')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const isOriginAllowed = (origin: string | undefined): boolean => {
    if (!origin) return true;
    if (corsOrigins.includes(origin)) return true;
    if (process.env.NODE_ENV !== 'production') {
      return /^http:\/\/(localhost|127\.0\.0\.1):(5173|5174|5175|3000|3001)$/.test(
        origin,
      );
    }
    return false;
  };

  app.setGlobalPrefix('api');
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cookieParser());
  app.use((request: Request, response: Response, next: NextFunction) => {
    const requestId = request.header('x-request-id') ?? randomUUID();
    (request as Request & { requestId?: string }).requestId = requestId;
    response.setHeader('x-request-id', requestId);

    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      const origin = request.headers.origin;

      if (origin && !isOriginAllowed(origin)) {
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
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      callback(null, isOriginAllowed(origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-request-id',
      'Idempotency-Key',
      'Accept',
    ],
  });

  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
