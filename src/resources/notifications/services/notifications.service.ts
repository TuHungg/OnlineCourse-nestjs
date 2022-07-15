import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import dummy_notifications from 'src/common/dummy_data/dummy_notifications';
import { BaseModel } from 'src/common/shared/base-model';
import { Notification, NotificationDocument } from '../schemas/notification.schema';
import { ClientQueryDto } from './../../../common/shared/dtos/client-query.dto';

@Injectable()
export class NotificationsService extends BaseModel<Notification, NotificationDocument> {
    get dummyData(): any[] {
        return dummy_notifications;
    }
    constructor(
        @InjectModel(Notification.name) protected notificationModel: Model<NotificationDocument>
    ) {
        super('notifications', notificationModel);
    }

    getUserNotifications(options: { userId: string }, query: ClientQueryDto) {
        return this.model
            .find({ receiver: options.userId })
            .sort({
                createdAt: -1,
            })
            .skip(BaseModel.getSkipValue(query._page, query._limit))
            .limit(query._limit)
            .exec();
    }

    countUserNotifications(options: { userId: string }) {
        return this.model.count({ receiver: options.userId });
    }

    countUserUnreadNotifications(options: { userId: string }) {
        return this.model.count({ receiver: options.userId, isRead: false });
    }

    countUserNewNotifications(options: { userId: string }) {
        return this.model.count({ receiver: options.userId, isNew: true });
    }

    reachNew(options: { userId: string }) {
        return this.model.updateMany(
            {
                receiver: options.userId,
                isNew: true,
            },
            {
                $set: {
                    isNew: false,
                },
            }
        );
    }

    read(options: { userId: string; notificationId: string }) {
        return this.model.updateMany(
            {
                _id: options.notificationId,
                receiver: options.userId,
            },
            {
                $set: {
                    isRead: true,
                },
            }
        );
    }
}
