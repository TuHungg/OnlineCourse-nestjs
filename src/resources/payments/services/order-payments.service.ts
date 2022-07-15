import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MomoService } from 'src/common/shared/services/momo.service';
import DateHelper from 'src/common/utils/helpers/date.helper';
import Helper from 'src/common/utils/helpers/helper.helper';
import { CoursesService } from 'src/resources/courses/services/courses.service';
import { Transaction } from 'src/resources/transactions/schemas/transaction.schema';
import { Payment, PaymentDocument } from '../schemas/payment.schema';
import { IMomoPaymentExtraData } from './../../../common/shared/services/momo.service';
import { MoneyConfiguration } from './../../configuration/schemas/configuration.schema';
import { TransactionsService } from './../../transactions/transactions.service';
import { PaymentsService } from './payments.service';

@Injectable()
export class OrderPaymentsService extends PaymentsService {
    constructor(
        @InjectModel(Payment.name) protected readonly paymentModel: Model<PaymentDocument>,
        protected transactionsService: TransactionsService,
        protected coursesService: CoursesService
    ) {
        super(paymentModel);
    }

    async fetchPendingPaymentOrCreateIfNotExists(userId: string): Promise<Payment> {
        const { first, last } = DateHelper.getBoundaryDateOfMonth(new Date());
        const filter = {
            user: userId,
            status: 'pending',
            'history.createdAt': {
                $gte: first.toISOString(),
                $lte: last.toISOString(),
            },
        };
        const item = await this.model.findOne<Payment>(filter);
        if (!!item) return item;
        const data = this.attachHistoryData({ status: 'pending', user: userId }, 'create');
        return new this.model(data).save();
    }

    async fetchPaymentOrCreateIfNotExists(userId: string, date: Date) {
        const { first, last } = DateHelper.getBoundaryDateOfMonth(date);
        const item = await this.model.findOne<Payment>({
            user: Helper.cvtObjectId(userId),
            'history.createdAt': {
                $gte: first.toISOString(),
                $lte: last.toISOString(),
            },
        });
        if (!!item) return item;
        const data = this.attachHistoryData(
            {
                status: 'paid',
                user: userId,
                history: {
                    paidAt: date.toISOString(),
                },
            },
            'create',
            undefined,
            date
        );
        return new this.model(data).save();
    }
    async testHandleCheckout(
        data: IMomoPaymentExtraData,
        moneyConfiguration: MoneyConfiguration,
        date?: Date
    ) {
        const courseIds = data.courses.map((item) => item._id);
        const courses = await this.coursesService.model.find({
            _id: {
                $in: courseIds,
            },
        });
        const transactionsData = [];
        const paymentObj = {};
        for (const item of data.courses) {
            const course = courses.find((course) => course._id == item._id);
            const payment = await this.fetchPaymentOrCreateIfNotExists(
                course.history.createdBy.toString(),
                date
            );
            paymentObj[`${payment._id}`] = 1;
            let payload: Partial<Transaction> = {
                course: item._id as any,
                instructor: course.history.createdBy,
                customer: data.userId as any,
                payment: payment._id as any,
                moneyConfiguration: moneyConfiguration,
                salePrice: MomoService.getSalePrice(item.salePrice),
            };
            payload = super.attachHistoryData(payload, 'create', undefined, date);
            transactionsData.push(payload);
        }
        await this.transactionsService.model.insertMany(transactionsData);
        const paymentIds = Object.keys(paymentObj);
        const updatePayments = Promise.all(
            paymentIds.map(async (id) => {
                return this.getPaymentDetail(id).then((item) => {
                    this.model
                        .updateOne(
                            {
                                _id: item._id,
                            },
                            {
                                $set: {
                                    amount: item.amount,
                                    commissionAmount: item.commissionAmount,
                                    earnings: item.earnings,
                                },
                            }
                        )
                        .exec();
                });
            })
        );
        const payments = await updatePayments;
        return payments;
    }

    async handleCheckout(data: IMomoPaymentExtraData, moneyConfiguration: MoneyConfiguration) {
        const courseIds = data.courses.map((item) => item._id);
        const courses = await this.coursesService.model.find({
            _id: {
                $in: courseIds,
            },
        });
        const transactionsData = [];
        for (const item of data.courses) {
            const course = courses.find((course) => course._id == item._id);
            const payment = await this.fetchPendingPaymentOrCreateIfNotExists(
                course.history.createdBy.toString()
            );
            let payload: Partial<Transaction> = {
                course: item._id as any,
                instructor: course.history.createdBy,
                customer: data.userId as any,
                payment: payment._id as any,
                moneyConfiguration: moneyConfiguration,
                salePrice: MomoService.getSalePrice(item.salePrice),
            };
            payload = super.attachHistoryData(payload, 'create');
            transactionsData.push(payload);
        }
        this.transactionsService.model.insertMany(transactionsData);
    }
}
