import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { HistoryType } from 'src/common/shared/schemas/shared.schema';

export type SliderDocument = Slider & mongoose.Document;

@Schema()
export class Slider {
    _id: mongoose.Schema.Types.ObjectId;
    @Prop({ require: true, unique: true })
    name: string;
    @Prop({ default: 'inactive' })
    status: string;
    @Prop()
    description?: string;
    @Prop()
    picture?: string;
    @Prop({ required: true, default: {} })
    history: HistoryType;
}

export const SliderSchema = SchemaFactory.createForClass(Slider);
