import {
  Controller,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Response } from '../common/response/response';
import type { AuthenticatedUser } from '../common/types/authenticated-user';
import { DocumentCheckService } from './document-check.service';

@Roles('citizen')
@Controller('preparations/:preparationId/documents/:documentId/check')
export class DocumentCheckController {
  constructor(private readonly checks: DocumentCheckService) {}

  @Post()
  @HttpCode(200)
  @Throttle({ default: { limit: 4, ttl: 60_000 } })
  async check(
    @Param('preparationId', ParseUUIDPipe) preparationId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return new Response({
      data: await this.checks.check(preparationId, documentId, user.id),
    });
  }
}
