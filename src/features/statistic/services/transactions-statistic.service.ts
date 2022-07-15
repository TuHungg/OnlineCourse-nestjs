import { Injectable } from '@nestjs/common';
import { TIME_ZONE } from 'src/common/utils/constants/app.constant';
import Helper from 'src/common/utils/helpers/helper.helper';
import { ChartDataOptionsDto } from 'src/resources/users/dto/chart-data-options.dto';
import { TotalDataOptionsDto } from 'src/resources/users/dto/total-data-options.dto';
import { TransactionsService } from './../../../resources/transactions/transactions.service';

@Injectable()
export class TransactionsStatisticService {
    constructor(private transactionsService: TransactionsService) {}

    // STATS
    async fetchRevenueStats(data: ChartDataOptionsDto, instructorId?: string) {
        const pipeline = [
            ...this.getInstructorStatsPreprocessPipeline(
                data,
                {
                    salePrice: 1,
                },
                instructorId
            ),
            {
                $group: {
                    _id: '$date',
                    value: {
                        $sum: {
                            $multiply: [
                                '$salePrice',
                                TransactionsStatisticService.getCommissionRate(!!instructorId),
                            ],
                        },
                    },
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
            {
                $project: {
                    date: '$_id',
                    value: 1,
                    _id: 0,
                },
            },
        ];
        const result = await this.transactionsService.model.aggregate(pipeline);
        return result;
    }
    //
    async fetchEnrollmentsStats(data: ChartDataOptionsDto, instructorId?: string) {
        const pipeline = [
            ...this.getInstructorStatsPreprocessPipeline(data, undefined, instructorId),
            // calc
            {
                $group: {
                    _id: '$date',
                    value: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
            {
                $project: {
                    date: '$_id',
                    value: 1,
                    _id: 0,
                },
            },
        ];
        const result = await this.transactionsService.model.aggregate(pipeline);
        return result;
    }
    // CALC TOTAL
    async fetchTotalRevenue(data: TotalDataOptionsDto, instructorId?: string) {
        const commissionRate = !!instructorId
            ? '$moneyConfiguration.instructorCommission'
            : { $subtract: [1, '$moneyConfiguration.instructorCommission'] };
        //
        const pipeline = [
            ...this.getInstructorTotalPreprocessPipeline(data, instructorId),
            // convert date string to date
            {
                $group: {
                    _id: '$course.history.createdBy',
                    amount: {
                        $sum: '$salePrice',
                    },
                    moneyConfiguration: { $first: '$moneyConfiguration' },
                },
            },
            {
                $project: {
                    amount: {
                        $multiply: ['$amount', commissionRate],
                    },
                },
            },
        ];
        const result = await this.transactionsService.model.aggregate(pipeline);
        return result[0]?.amount || 0;
    }
    async fetchTotalEnrollments(data: TotalDataOptionsDto, instructorId?: string) {
        //
        const pipeline = [
            ...this.getInstructorTotalPreprocessPipeline(data, instructorId),
            // convert date string to date
            {
                $count: 'n',
            },
        ];
        const result = await this.transactionsService.model.aggregate(pipeline);
        return this.transactionsService.handleCountResult(result);
    }
    //
    private getInstructorStatsPreprocessPipeline(
        data: ChartDataOptionsDto,
        project?: any,
        instructorId?: string
    ): any {
        const minDate = new Date();
        let timeFormat;
        switch (data.timeUnit) {
            case 'd':
                minDate.setDate(minDate.getDate() - data.value);
                timeFormat = '%Y-%m-%d';
                // timeFormat = '%d';
                break;
            case 'M':
                minDate.setMonth(minDate.getMonth() - data.value);
                minDate.setDate(1);
                timeFormat = '%Y-%m';
                // timeFormat = '%m';
                break;
            default:
                minDate.setMonth(minDate.getMonth() - data.value);
                // timeFormat = '%m';
                break;
        }
        //
        const matchPipeline = [
            {
                $match: {
                    'timestamps.createdAt': {
                        $gte: minDate.toISOString(),
                    },
                },
            },
        ];
        if (instructorId) {
            matchPipeline[0].$match['instructor'] = Helper.cvtObjectId(instructorId);
        }
        if (data['course._id_filter'])
            matchPipeline[0].$match['course'] = Helper.cvtObjectId(data['course._id_filter']);

        const pipeline = [
            ...matchPipeline,
            // convert date string to date
            {
                $addFields: {
                    convertedDate: {
                        $toDate: '$timestamps.createdAt',
                    },
                },
            },
            // format date & project needed values
            {
                $project: {
                    date: {
                        $dateToString: {
                            format: timeFormat,
                            date: '$convertedDate',
                            timezone: TIME_ZONE,
                        },
                    },
                    moneyConfiguration: 1,
                    ...project,
                },
            },
        ];
        return pipeline;
    }
    //
    private getInstructorTotalPreprocessPipeline(data: TotalDataOptionsDto, instructorId?: string) {
        //
        let minDate;
        switch (data.range) {
            case 'M':
                minDate = new Date();
                minDate.setDate(1);
                minDate.setHours(0);
                minDate.setMinutes(0);
                minDate.setSeconds(0);
                minDate.setMilliseconds(0);
                break;
        }
        //
        const matchPipeline = [
            {
                $match: {},
            },
        ];
        if (instructorId) {
            matchPipeline[0].$match['instructor'] = Helper.cvtObjectId(instructorId);
        }
        if (minDate) {
            matchPipeline[0].$match['timestamps.createdAt'] = {
                $gte: minDate.toISOString(),
            };
        }
        if (data['course._id_filter'])
            matchPipeline[0].$match['course'] = Helper.cvtObjectId(data['course._id_filter']);

        const pipeline = [...matchPipeline];
        return pipeline;
    }

    static getCommissionRate(isInstructor: boolean) {
        const commissionRate = isInstructor
            ? '$moneyConfiguration.instructorCommission'
            : { $subtract: [1, '$moneyConfiguration.instructorCommission'] };
        return commissionRate;
    }
}
