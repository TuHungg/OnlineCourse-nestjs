import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClientQueryDto } from 'src/common/shared/dtos/client-query.dto';
import Helper from 'src/common/utils/helpers/helper.helper';
import { UserCourseService } from 'src/resources/user-course/user-course.service';
import { User, UserDocument } from '../schemas/user.schema';
import { UsersService } from '../users.service';
import { PaymentsService } from './../../payments/services/payments.service';

@Injectable()
export class UserPaymentService extends UsersService {
    constructor(
        @InjectModel(User.name) protected userModel: Model<UserDocument>,
        protected userCourseService: UserCourseService,
        protected paymentsService: PaymentsService
    ) {
        super(userModel, userCourseService);
    }
    private get instructorWithPaymentDataPipeline() {
        return [
            {
                $lookup: {
                    from: 'payments',
                    let: {
                        user: '$_id',
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ['$$user', '$user'],
                                        },
                                        {
                                            $eq: ['$status', 'pending'],
                                        },
                                    ],
                                },
                            },
                        },
                        ...this.paymentsService.getPaymentCalculationPipeline({ field: 'meta' }),
                        {
                            $project: {
                                status: 1,
                                amount: '$meta.amount',
                                commissionAmount: '$meta.commissionAmount',
                                earnings: '$meta.earnings',
                                history: 1,
                            },
                        },
                    ],
                    as: 'pendingPayments',
                },
            },
            {
                $project: {
                    email: 1,
                    profile: 1,
                    pendingAmount: {
                        $sum: '$pendingPayments.earnings',
                    },
                    numPending: {
                        $size: '$pendingPayments',
                    },
                    firstPendingCreatedAt: {
                        $first: '$pendingPayments.history.createdAt',
                    },
                    // pendingPayments: 1,
                },
            },
        ];
    }

    private getInstructorsWithPaymentPipeline(query: ClientQueryDto) {
        const standardQuery = this.cvtStandardizedQuery(query);
        const pipeline = [
            // LOOKUP ROLE
            ...super.getLookup({
                from: 'roles',
                localField: 'role',
                project: {
                    name: 1,
                },
                lookupOne: true,
            }),
            // FIND INSTRUCTOR
            {
                $match: {
                    ...standardQuery.filter,
                    'role.name': 'Instructor',
                },
            },
        ];
        return pipeline;
    }
    async getInstructorsWithPayment(query: ClientQueryDto): Promise<User[]> {
        const standardQuery = super.cvtStandardizedQuery(query);
        let pipeline = this.getInstructorsWithPaymentPipeline(query);
        pipeline = pipeline.concat([
            ...this.instructorWithPaymentDataPipeline,
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
        ]);
        const result = await this.model.aggregate(pipeline);
        return result;
    }
    async countInstructorsWithPayment(query: ClientQueryDto): Promise<number> {
        const pipeline = this.getInstructorsWithPaymentPipeline(query);
        const result = await this.model.aggregate([
            ...pipeline,
            {
                $count: 'n',
            },
        ]);
        return super.handleCountResult(result);
    }

    async getInstructorWithPayment(userId: string): Promise<User> {
        const pipeline = [
            {
                $match: {
                    _id: Helper.cvtObjectId(userId),
                },
            },
            ...this.instructorWithPaymentDataPipeline,
        ];
        const result = await this.model.aggregate(pipeline);
        if (result.length > 0) return result.at(0);
        return null;
    }
}
