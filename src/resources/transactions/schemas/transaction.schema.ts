import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { HistoryTimestampType } from 'src/common/shared/schemas/shared.schema';
import { Payment } from 'src/resources/payments/schemas/payment.schema';
import { User } from 'src/resources/users/schemas/user.schema';
import { MoneyConfiguration } from '../../configuration/schemas/configuration.schema';
import { Course } from '../../courses/schemas/course.schema';

const { Types } = mongoose.Schema;
export type TransactionDocument = Transaction & mongoose.Document;

@Schema()
export class Transaction {
    _id: mongoose.Schema.Types.ObjectId;
    @Prop({ required: true, type: Types.ObjectId, ref: Payment.name })
    payment: Payment;
    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    customer: User;
    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    instructor: User;
    @Prop({ required: true, type: Types.ObjectId, ref: Course.name })
    course: Course;
    @Prop({ required: true })
    salePrice: number;
    @Prop({ required: true })
    moneyConfiguration: MoneyConfiguration;
    @Prop({ default: {} })
    timestamps: HistoryTimestampType;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
