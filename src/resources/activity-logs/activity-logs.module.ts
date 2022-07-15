import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CaslModule } from 'src/casl/casl.module';
import { SharedModule } from 'src/common/shared/shared.module';
import { UsersModule } from '../users/users.module';
import { MailModule } from './../../mail/mail.module';
import { NotificationsModule } from './../notifications/notifications.module';
import { ActivityLogsController } from './activity-logs.controller';
import { ActivityLogsService } from './activity-logs.service';
import { ActivityLog, ActivityLogSchema } from './schemas/activity-logs.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: ActivityLog.name,
                schema: ActivityLogSchema,
            },
        ]),
        SharedModule,
        CaslModule,
        MailModule,
        NotificationsModule,
        UsersModule,
    ],
    controllers: [ActivityLogsController],
    providers: [ActivityLogsService],
})
export class ActivityLogsModule {}
