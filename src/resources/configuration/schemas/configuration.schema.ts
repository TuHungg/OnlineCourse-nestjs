import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type ConfigurationDocument = Configuration & mongoose.Document;

@Schema({ _id: false })
export class CourseConfiguration {
    @Prop()
    priceTiers: number[];
}

@Schema({ _id: false })
export class MoneyConfiguration {
    @Prop()
    instructorCommission: number;
}

@Schema()
export class Configuration {
    _id: mongoose.Schema.Types.ObjectId;
    @Prop({ default: {} })
    course: CourseConfiguration;
    @Prop({ default: {} })
    money: MoneyConfiguration;
}

export const ConfigurationSchema = SchemaFactory.createForClass(Configuration);
