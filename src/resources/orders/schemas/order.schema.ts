import { MoneyConfiguration } from './../../configuration/schemas/configuration.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { HistoryType } from 'src/common/shared/schemas/shared.schema';
import { Course } from 'src/resources/courses/schemas/course.schema';

const { Types } = mongoose.Schema;

export type OrderDocument = Order & mongoose.Document;

@Schema({ _id: false })
export class CourseInOrder {
    @Prop({ required: true, type: Types.ObjectId, ref: Course.name })
    course: Course;
    @Prop({ required: true })
    salePrice: number;
    @Prop({ required: true })
    price: number;
}
const CourseInOrderSchema = SchemaFactory.createForClass(CourseInOrder);

@Schema()
export class Order {
    _id: mongoose.Schema.Types.ObjectId;
    @Prop({ require: true, default: 0 })
    totalPrice: number;
    @Prop({ type: [{ type: CourseInOrderSchema }], required: true })
    coursesInOrder: CourseInOrder[];
    @Prop({ default: {} })
    moneyConfiguration: MoneyConfiguration;
    @Prop({ required: true, default: {} })
    history: HistoryType;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
