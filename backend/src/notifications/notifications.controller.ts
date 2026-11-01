import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Response } from '../common/response/response';
import type { AuthenticatedUser } from '../common/types/authenticated-user';
import { ListNotificationsQueryDto } from './dto/list-notifications.query.dto';
import {
  NOTIFICATIONS_SERVICE,
  type INotificationsService,
} from './interfaces/notifications.service.interface';

@Roles('citizen', 'officer', 'admin')
@Controller('notifications')
export class NotificationsController {
  constructor(
    @Inject(NOTIFICATIONS_SERVICE)
    private readonly notificationsService: INotificationsService,
  ) {}

  @Get()
  async list(
    @Query() query: ListNotificationsQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.notificationsService.listNotifications(
      user.id,
      query,
    );

    return new Response({
      data: result.data,
      meta: result.meta,
    });
  }

  @Get('unread-count')
  async countUnread(@CurrentUser() user: AuthenticatedUser) {
    const count = await this.notificationsService.countUnread(user.id);
    return new Response({
      data: { unread_count: count },
    });
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.notificationsService.markAsRead(id, user.id);
  }

  @Post('read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAllAsRead(@CurrentUser() user: AuthenticatedUser) {
    await this.notificationsService.markAllAsRead(user.id);
  }
}
