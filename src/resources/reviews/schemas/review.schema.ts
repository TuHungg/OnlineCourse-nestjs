import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { HistoryTimestampType } from 'src/common/shared/schemas/shared.schema';
import { User } from 'src/resources/users/schemas/user.schema';
import { Course, CourseDocument } from './../../courses/schemas/course.schema';
import { UserDocument } from './../../users/schemas/user.schema';

const { Types } = mongoose.Schema;

export type ReviewDocument = Review & mongoose.Document;

@Schema({ _id: false })
export class Response {
    @Prop({ type: Types.ObjectId, ref: User.name })
    user: User;
    @Prop()
    content: string;
    @Prop()
    timestamp: string;
}

@Schema()
export class Review {
    _id: mongoose.Schema.Types.ObjectId;
    @Prop({ required: true })
    rating: number;
    @Prop()
    content?: string;
    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    user: UserDocument;
    @Prop({ required: true, type: Types.ObjectId, ref: Course.name })
    course: CourseDocument;
    @Prop()
    response?: Response;
    @Prop({ default: {} })
    timestamps: HistoryTimestampType;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
