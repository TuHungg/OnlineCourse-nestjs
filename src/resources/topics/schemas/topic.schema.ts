import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Category } from 'src/resources/categories/schemas/category.schema';
import { HistoryType } from 'src/common/shared/schemas/shared.schema';

const { Types } = mongoose.Schema;

export type TopicDocument = Topic & mongoose.Document;

@Schema()
export class Topic {
    _id: mongoose.Schema.Types.ObjectId;
    @Prop({ require: true })
    name: string;
    @Prop({ require: true, unique: true, index: true })
    slug: string;
    @Prop({ type: [{ type: Types.ObjectId, ref: Category.name }] })
    categories?: Category[];
    @Prop({ required: true, default: {} })
    history: HistoryType;
}

export const TopicSchema = SchemaFactory.createForClass(Topic);
