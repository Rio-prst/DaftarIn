import { randomUUID } from 'node:crypto';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import express, {
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import helmet from 'helmet';
import { AppModule } from '../src/app.module';
import { setupSwagger } from '../src/setup-swagger';

const server = express();
let isReady = false;

server.get('/', (_req, res) => {
  res.redirect('/api/docs');
});

server.get('/api', (_req, res) => {
  res.redirect('/api/docs');
});

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3001')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.setGlobalPrefix('api');
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cookieParser());
  app.use((request: Request, response: Response, next: NextFunction) => {
    const requestId = request.header('x-request-id') ?? randomUUID();
    (request as Request & { requestId?: string }).requestId = requestId;
    response.setHeader('x-request-id', requestId);
    next();
  });
  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true,
  });

  setupSwagger(app);

  await app.init();
  isReady = true;
}

export default async function handler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    if (!isReady) {
      await bootstrap();
    }
    const matchedPath = (req.headers['x-matched-path'] ??
      req.headers['x-forwarded-uri']) as string | undefined;
    if (matchedPath) {
      req.url = matchedPath;
    }
    server(req, res);
  } catch (error: any) {
    console.error('Serverless bootstrap error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_BOOTSTRAP_ERROR',
        message: error?.message ?? 'Gagal menginisialisasi server.',
      },
    });
  }
}
