import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { File } from 'src/resources/files/schemas/file.schema';
import { HistoryTimestampType } from './../../../common/shared/schemas/shared.schema';

export type LectureDocument = Lecture & mongoose.Document;

@Schema()
export class Lecture {
    _id: mongoose.Schema.Types.ObjectId;
    @Prop({ required: true })
    title: string;
    @Prop()
    description?: string;
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: File.name })
    video?: File;
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: File.name })
    thumbnail?: File;
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId }], ref: File.name })
    resources: File[] | string[];
    // @Prop({
    //     type: [{ type: mongoose.Schema.Types.ObjectId }],
    //     ref: Comment.name,
    // })
    // comments?: Comment[];
    @Prop({ required: true, default: {} })
    history: HistoryTimestampType;
}

export const LectureSchema = SchemaFactory.createForClass(Lecture);
