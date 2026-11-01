import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import type { Request, Response } from 'express';
import { GlobalExceptionFilter } from './global-exception.filter';

type ResponseMock = {
  status: jest.Mock;
  json: jest.Mock;
};

function makeHost(): {
  host: ArgumentsHost;
  response: ResponseMock;
} {
  const json = jest.fn();
  const response: ResponseMock = {
    status: jest.fn(),
    json,
  };
  response.status.mockReturnValue(response);
  const request = { requestId: 'request-1' } as unknown as Request & {
    requestId: string;
  };
  const host = {
    switchToHttp: () => ({
      getResponse: () => response as unknown as Response,
      getRequest: () => request,
    }),
  } as unknown as ArgumentsHost;

  return { host, response };
}

describe('GlobalExceptionFilter', () => {
  const filter = new GlobalExceptionFilter();

  it('normalizes an HttpException with a string message', () => {
    const { host, response } = makeHost();

    filter.catch(
      new HttpException('Bad request', HttpStatus.BAD_REQUEST),
      host,
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Bad request',
        request_id: 'request-1',
      },
    });
  });

  it('normalizes validation message arrays into details', () => {
    const { host, response } = makeHost();

    filter.catch(
      new BadRequestException({
        message: ['email must be an email', 'password is too short'],
      }),
      host,
    );

    expect(response.json).toHaveBeenCalledWith({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request tidak valid.',
        details: ['email must be an email', 'password is too short'],
        request_id: 'request-1',
      },
    });
  });

  it('maps a conflict exception to the conflict code', () => {
    const { host, response } = makeHost();

    filter.catch(new ConflictException('Email sudah terdaftar'), host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(response.json).toHaveBeenCalledWith({
      error: {
        code: 'CONFLICT',
        message: 'Email sudah terdaftar',
        request_id: 'request-1',
      },
    });
  });

  it('keeps a custom code and details from the exception payload', () => {
    const { host, response } = makeHost();

    filter.catch(
      new HttpException(
        {
          code: 'CUSTOM_ERROR',
          message: 'Custom message',
          details: { field: 'email' },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      ),
      host,
    );

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
    expect(response.json).toHaveBeenCalledWith({
      error: {
        code: 'CUSTOM_ERROR',
        message: 'Custom message',
        details: { field: 'email' },
        request_id: 'request-1',
      },
    });
  });

  it('hides unknown errors behind an internal error response', () => {
    const { host, response } = makeHost();

    filter.catch(new Error('database exploded'), host);

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(response.json).toHaveBeenCalledWith({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Terjadi kesalahan pada server.',
        request_id: 'request-1',
      },
    });
  });
});
