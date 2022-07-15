import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { HistoryType } from 'src/common/shared/schemas/shared.schema';
import { User } from 'src/resources/users/schemas/user.schema';

const { Types } = mongoose.Schema;
export type PaymentDocument = Payment & mongoose.Document;

@Schema({ _id: false })
export class PaymentHistory extends HistoryType {
    @Prop()
    paidAt?: string;
}

export type TPaymentStatus = 'pending' | 'paid';
@Schema()
export class Payment {
    _id: mongoose.Schema.Types.ObjectId;
    @Prop({ required: true, default: 'pending' })
    status: TPaymentStatus;
    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    user: User;
    @Prop()
    amount: number;
    @Prop()
    commissionAmount: number;
    @Prop()
    earnings: number;
    @Prop({ default: {} })
    history: PaymentHistory;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
