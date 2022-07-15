import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import dummy_payments from 'src/common/dummy_data/dummy_payments';
import { BaseModel } from 'src/common/shared/base-model';
import Helper from 'src/common/utils/helpers/helper.helper';
import { Payment, PaymentDocument } from '../schemas/payment.schema';

@Injectable()
export class PaymentsService extends BaseModel<Payment, PaymentDocument> {
    get dummyData(): any[] {
        return dummy_payments;
    }
    constructor(
        @InjectModel(Payment.name) protected readonly paymentModel: Model<PaymentDocument>
    ) {
        super('payments', paymentModel);
    }

    async fetchPendingPaymentOrCreateIfNotExists(userId: string): Promise<Payment> {
        const item = await this.model.findOne<Payment>({ user: userId, status: 'pending' });
        if (!!item) return item;
        const data = this.attachHistoryData({ status: 'pending', user: userId }, 'create');
        return new this.model(data).save();
    }

    async getPendingPayments(userId: string): Promise<Payment[] | null> {
        const pendingPayments = await this.model
            .find({ user: userId, status: 'pending' })
            .sort({ 'history.createdAt': -1 });
        if (pendingPayments.length > 0) {
            return Promise.all(pendingPayments.map((item) => this.getPaymentDetail(item._id)));
        }
    }

    getPaymentCalculationPipeline(options: { field: string }) {
        return [
            {
                $lookup: {
                    from: 'transactions',
                    let: {
                        payment: '$_id',
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$$payment', '$payment'],
                                },
                            },
                        },
                        {
                            $addFields: {
                                commissionAmount: {
                                    $multiply: [
                                        '$salePrice',
                                        {
                                            $subtract: [
                                                1,
                                                '$moneyConfiguration.instructorCommission',
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                        {
                            $group: {
                                _id: 1,
                                amount: {
                                    $sum: '$salePrice',
                                },
                                commissionAmount: {
                                    $sum: '$commissionAmount',
                                },
                            },
                        },
                        {
                            $project: {
                                amount: 1,
                                commissionAmount: 1,
                                earnings: {
                                    $subtract: ['$amount', '$commissionAmount'],
                                },
                            },
                        },
                    ],
                    as: options.field,
                },
            },
            {
                $unwind: {
                    path: '$meta',
                    preserveNullAndEmptyArrays: true,
                },
            },
        ];
    }

    async getPaymentDetail(paymentId: string): Promise<Payment | null> {
        const result = await this.model.aggregate([
            {
                $match: { _id: Helper.cvtObjectId(paymentId) },
            },
            ...this.getPaymentCalculationPipeline({ field: 'meta' }),
            {
                $project: {
                    status: 1,
                    user: 1,
                    commissionAmount: '$meta.commissionAmount',
                    earnings: '$meta.earnings',
                    amount: '$meta.amount',
                    history: 1,
                },
            },
        ]);
        if (result.length > 0) return result[0];
        return null;
    }

    async pay(userId: string, paymentId: string) {
        const item = await this.getPaymentDetail(paymentId);
        if (item) {
            const data: Partial<Payment> = {
                status: 'paid',
                amount: item.amount,
                commissionAmount: item.commissionAmount,
                earnings: item.earnings,
                history: {
                    paidAt: new Date().toISOString(),
                } as any,
            };
            return this.model.updateOne(
                {
                    _id: paymentId,
                },
                {
                    $set: Helper.cvtDotObj(this.attachHistoryData(data, 'update', userId)),
                }
            );
        }
    }

    async payAll(userId: string, instructorId: string) {
        const pendingPayments = await this.model
            .find({ user: instructorId, status: 'pending' }, { _id: 1 })
            .sort({ 'history.createdAt': 1 })
            .exec();
        const pendingPaymentIds = pendingPayments.map((item) => item._id);
        await Promise.all(pendingPaymentIds.map((id) => this.pay(userId, id)));
        return pendingPaymentIds;
    }
}
