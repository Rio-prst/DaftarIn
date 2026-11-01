import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

type ErrorPayload = {
  code?: string;
  message?: string | string[];
  details?: unknown;
};

type NormalizedError = {
  code: string;
  message: string;
  details?: unknown;
};

const STATUS_CODE_BY_HTTP_STATUS = new Map<number, string>([
  [HttpStatus.BAD_REQUEST, 'VALIDATION_ERROR'],
  [HttpStatus.UNAUTHORIZED, 'UNAUTHORIZED'],
  [HttpStatus.FORBIDDEN, 'FORBIDDEN'],
  [HttpStatus.NOT_FOUND, 'NOT_FOUND'],
  [HttpStatus.CONFLICT, 'CONFLICT'],
  [HttpStatus.PAYLOAD_TOO_LARGE, 'PAYLOAD_TOO_LARGE'],
  [HttpStatus.UNSUPPORTED_MEDIA_TYPE, 'UNSUPPORTED_MEDIA_TYPE'],
  [HttpStatus.TOO_MANY_REQUESTS, 'RATE_LIMITED'],
]);

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request & { requestId?: string }>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (!(exception instanceof HttpException)) { console.error('[UNHANDLED EXCEPTION]:', exception); }
    const normalized = this.normalize(exception);

    response.status(status).json({
      error: {
        code: normalized.code,
        message: normalized.message,
        ...(normalized.details === undefined
          ? {}
          : { details: normalized.details }),
        request_id: request.requestId,
      },
    });
  }

  private normalize(exception: unknown): NormalizedError {
    if (!(exception instanceof HttpException)) {
      return {
        code: 'INTERNAL_ERROR',
        message: 'Terjadi kesalahan pada server.',
      };
    }

    const status = exception.getStatus();
    const payload = exception.getResponse();

    if (typeof payload === 'string') {
      return {
        code: this.codeForStatus(status),
        message: payload,
      };
    }

    const data = payload as ErrorPayload;
    const message = Array.isArray(data.message)
      ? 'Request tidak valid.'
      : (data.message ?? exception.message);

    return {
      code: data.code ?? this.codeForStatus(status),
      message,
      details:
        data.details ??
        (Array.isArray(data.message) ? data.message : undefined),
    };
  }

  private codeForStatus(status: number): string {
    return (
      STATUS_CODE_BY_HTTP_STATUS.get(status) ??
      (status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR')
    );
  }
}
