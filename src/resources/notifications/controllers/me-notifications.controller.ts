import { Controller, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ClientQueryDto } from 'src/common/shared/dtos/client-query.dto';
import { SystemNotificationsService } from '../services/system-notifications.service';
import { NotificationsService } from './../services/notifications.service';

@ApiTags('notifications/me')
@Controller('notifications/me')
export class MeNotificationsController {
    constructor(
        private readonly systemNotificationsService: SystemNotificationsService,
        private readonly notificationsService: NotificationsService
    ) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    fetch(@Req() req, @Query() query: ClientQueryDto) {
        return this.notificationsService.getUserNotifications({ userId: req.user._id }, query);
    }

    @Get('count')
    @UseGuards(JwtAuthGuard)
    count(@Req() req) {
        return this.notificationsService.countUserNotifications({ userId: req.user._id });
    }

    @Get('count-unread')
    @UseGuards(JwtAuthGuard)
    countUnread(@Req() req) {
        return this.notificationsService.countUserUnreadNotifications({
            userId: req.user._id,
        });
    }

    @Get('count-new')
    @UseGuards(JwtAuthGuard)
    countNew(@Req() req) {
        return this.notificationsService.countUserNewNotifications({
            userId: req.user._id,
        });
    }

    @Patch('reach-new')
    @UseGuards(JwtAuthGuard)
    async reachNew(@Req() req) {
        const result = await this.notificationsService.reachNew({
            userId: req.user._id,
        });
        return result;
    }

    @Patch('read/:id')
    @UseGuards(JwtAuthGuard)
    async read(@Req() req, @Param('id') id) {
        const result = await this.notificationsService.read({
            userId: req.user._id,
            notificationId: id,
        });
        return result;
    }
}
