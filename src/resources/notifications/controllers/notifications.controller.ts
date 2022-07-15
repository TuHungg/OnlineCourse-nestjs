import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from 'src/common/shared/base-controller';
import { NotificationsService } from '../services/notifications.service';
import { Notification, NotificationDocument } from '../schemas/notification.schema';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController extends BaseController<Notification, NotificationDocument> {
    constructor(private readonly notificationsService: NotificationsService) {
        super(notificationsService);
    }

    // @Post()
    // create(@Body() createNotificationDto: CreateNotificationDto) {
    //     return this.notificationsService.create(createNotificationDto);
    // }

    // @Patch(':id')
    // update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    //     return this.notificationsService.updateById(id, updateNotificationDto);
    // }
}
