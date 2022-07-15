import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import dummy_transaction from 'src/common/dummy_data/dummy_transaction';
import { BaseModel } from 'src/common/shared/base-model';
import { ClientQueryDto } from 'src/common/shared/dtos/client-query.dto';
import Helper from 'src/common/utils/helpers/helper.helper';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import update from 'immutability-helper';

@Injectable()
export class TransactionsService extends BaseModel<Transaction, TransactionDocument> {
    get dummyData(): any[] {
        return dummy_transaction;
    }
    constructor(
        @InjectModel(Transaction.name) private readonly transactionModel: Model<TransactionDocument>
    ) {
        super('transactions', transactionModel);
    }

    private getPaymentTransactionsStandardizedQuery(paymentId: string, query: ClientQueryDto) {
        const standardQuery = super.cvtStandardizedQuery(query);
        standardQuery.filter = update(standardQuery.filter, {
            $merge: {
                payment: Helper.cvtObjectId(paymentId),
            },
        });
        return standardQuery;
    }

    async getPaymentTransactions(paymentId: string, query: ClientQueryDto) {
        const standardQuery = this.getPaymentTransactionsStandardizedQuery(paymentId, query);
        const pipeline = [
            {
                $match: standardQuery.filter,
            },
            {
                $sort: standardQuery.sort,
            },
            {
                $skip: standardQuery.skip,
            },
            {
                $limit: standardQuery.limit,
            },
            ...super.getLookup({
                from: 'users',
                localField: 'customer',
                project: {
                    email: 1,
                    profile: 1,
                },
                lookupOne: true,
            }),
            ...super.getLookup({
                from: 'courses',
                localField: 'course',
                project: {
                    basicInfo: 1,
                },
                lookupOne: true,
            }),
            {
                $addFields: {
                    commissionAmount: {
                        $multiply: [
                            '$salePrice',
                            {
                                $subtract: [1, '$moneyConfiguration.instructorCommission'],
                            },
                        ],
                    },
                },
            },
            {
                $project: {
                    salePrice: 1,
                    commissionAmount: 1,
                    customer: 1,
                    course: 1,
                    timestamps: 1,
                    earnings: {
                        $subtract: ['$salePrice', '$commissionAmount'],
                    },
                },
            },
        ];
        const result = await this.model.aggregate(pipeline);
        return result;
    }

    async countPaymentTransactions(paymentId: string, query: ClientQueryDto) {
        const standardQuery = this.getPaymentTransactionsStandardizedQuery(paymentId, query);
        const count = await this.model.count(standardQuery.filter);
        return count;
    }
}
