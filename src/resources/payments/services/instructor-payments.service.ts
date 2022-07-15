import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import update from 'immutability-helper';
import { Model } from 'mongoose';
import { ClientQueryDto } from 'src/common/shared/dtos/client-query.dto';
import Helper from 'src/common/utils/helpers/helper.helper';
import { Payment, PaymentDocument } from '../schemas/payment.schema';
import { PaymentsService } from './payments.service';

@Injectable()
export class InstructorPaymentsService extends PaymentsService {
    constructor(
        @InjectModel(Payment.name) protected readonly paymentModel: Model<PaymentDocument>
    ) {
        super(paymentModel);
    }

    private getPaymentsStandardQuery(userId: string, query: ClientQueryDto) {
        let standardQuery = super.cvtStandardizedQuery(query);
        standardQuery = update(standardQuery, {
            filter: {
                $merge: {
                    user: Helper.cvtObjectId(userId),
                    status: 'paid',
                },
            },
        });
        return standardQuery;
    }

    async fetchPayments(userId: string, query: ClientQueryDto) {
        const standardQuery = this.getPaymentsStandardQuery(userId, query);
        const result = await this.model.aggregate([
            {
                $match: standardQuery.filter,
            },
            {
                $sort: {
                    'history.createdAt': -1,
                    _id: -1,
                },
            },
            {
                $skip: standardQuery.skip,
            },
            {
                $limit: standardQuery.limit,
            },
        ]);
        return result;
    }

    async countPayments(userId: string, query: ClientQueryDto) {
        const standardQuery = this.getPaymentsStandardQuery(userId, query);
        const count = await this.model.count(standardQuery.filter);
        return count;
    }
}
