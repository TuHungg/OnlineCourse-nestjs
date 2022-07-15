import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { TController } from 'src/common/shared/types/shared.type';
import { User } from 'src/resources/users/schemas/user.schema';

export type NotificationDocument = Notification & mongoose.Document;

export type TNotificationSourceType =
    | 'course-approval'
    | 'new-comment'
    | 'payment-paid'
    | 'new-enrollment'
    | 'new-activity'
    | 'message';
@Schema()
export class Notification {
    _id: mongoose.Schema.Types.ObjectId;
    @Prop()
    sourceId?: string;
    @Prop()
    contextId?: string;
    @Prop()
    sourceSlug?: string;
    @Prop({ required: true, default: 'message' })
    sourceType: TNotificationSourceType;
    @Prop()
    collectionName?: TController;
    @Prop({
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: User.name,
    })
    receiver: User;
    @Prop({ required: true })
    content: string;
    @Prop()
    thumb?: string;
    @Prop({ default: false })
    isRead: boolean;
    @Prop({ default: true })
    isNew: boolean;
    @Prop({ required: true })
    createdAt: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
