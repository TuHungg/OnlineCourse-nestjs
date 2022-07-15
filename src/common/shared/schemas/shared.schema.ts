import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from '../../../resources/users/schemas/user.schema';

const { Types } = mongoose.Schema;

@Schema({ _id: false })
export class HistoryType {
    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy: User;
    @Prop({ default: new Date().toISOString() })
    createdAt?: string;
    @Prop({ type: Types.ObjectId, ref: 'User' })
    updatedBy?: User;
    @Prop()
    updatedAt?: string;
}

@Schema({ _id: false })
export class HistoryTimestampType {
    @Prop({ default: new Date().toISOString() })
    createdAt: string;
    @Prop()
    updatedAt?: string;
}

@Schema({ _id: false })
export class ReactionType {
    @Prop({
        require: true,
        default: [],
        type: [{ type: Types.ObjectId }],
        ref: 'User',
    })
    like: User[];
    @Prop({
        required: true,
        default: [],
        type: [{ type: Types.ObjectId }],
        ref: 'User',
    })
    dislike: User[];
}

export const HistoryTypeSchema = SchemaFactory.createForClass(HistoryType);
export const ReactionTypeSchema = SchemaFactory.createForClass(ReactionType);
export const HistoryTimestampTypeSchema = SchemaFactory.createForClass(HistoryTimestampType);
