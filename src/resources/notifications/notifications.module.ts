import { PaymentSchema } from './../payments/schemas/payment.schema';
import { Comment, CommentSchema } from './../comments/schemas/comment.schema';
import { User, UserSchema } from './../users/schemas/user.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CaslModule } from './../../casl/casl.module';
import { SharedModule } from './../../common/shared/shared.module';
import { Course, CourseSchema } from './../courses/schemas/course.schema';
import { MeNotificationsController } from './controllers/me-notifications.controller';
import { NotificationsController } from './controllers/notifications.controller';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { NotificationsService } from './services/notifications.service';
import { SystemNotificationsService } from './services/system-notifications.service';
import { Payment } from '../payments/schemas/payment.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Payment.name,
                schema: PaymentSchema,
            },
        ]),
        MongooseModule.forFeature([
            {
                name: Comment.name,
                schema: CommentSchema,
            },
        ]),
        MongooseModule.forFeature([
            {
                name: Notification.name,
                schema: NotificationSchema,
            },
        ]),
        MongooseModule.forFeature([
            {
                name: Course.name,
                schema: CourseSchema,
            },
        ]),
        MongooseModule.forFeature([
            {
                name: User.name,
                schema: UserSchema,
            },
        ]),
        SharedModule,
        CaslModule,
    ],

    controllers: [NotificationsController, MeNotificationsController],
    providers: [NotificationsService, SystemNotificationsService],
    exports: [NotificationsService, SystemNotificationsService],
})
export class NotificationsModule {}
