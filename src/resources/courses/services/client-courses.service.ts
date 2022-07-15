import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseModel } from 'src/common/shared/base-model';
import { ClientQueryDto } from 'src/common/shared/dtos/client-query.dto';
import { FetchOptionsDto } from 'src/common/shared/dtos/fetch-options.dto';
import ICountData from 'src/common/shared/interfaces/count-data.interface';
import { ICountResult } from 'src/common/shared/interfaces/count-result.interface';
import IStandardizedClientQuery from 'src/common/shared/interfaces/standardized-client-query.interface';
import Helper from 'src/common/utils/helpers/helper.helper';
import { CoursesService } from 'src/resources/courses/services/courses.service';
import { FilesService } from 'src/resources/files/files.service';
import { LecturesService } from 'src/resources/lectures/lectures.service';
import { QuizzesService } from 'src/resources/quizzes/quizzes.service';
import { Course, CourseDocument } from '../schemas/course.schema';
@Injectable()
export default class ClientCoursesService extends CoursesService {
    constructor(
        @InjectModel(Course.name) protected courseModel: Model<CourseDocument>,
        protected quizzesService: QuizzesService,
        protected filesService: FilesService,
        protected readonly lecturesService: LecturesService
    ) {
        super(courseModel);
    }

    private get clientExcerptProjection() {
        return {
            basicInfo: 1,
            promotions: 1,
            history: 1,
            meta: 1,
            details: 1,
        };
    }

    private getClientItemsPipeline(query: ClientQueryDto | IStandardizedClientQuery<Course>) {
        query = this.cvtStandardizedQuery(query);
        const filter = this.clientFilter;
        const sort = {
            'history.createdAt': -1,
        };
        query.filter = { ...query.filter, ...filter };
        if (Object.keys(query.sort).length == 0) {
            query.sort = sort;
        }
        return super.getPipelineStagesByClientQuery(query);
    }

    async fetchClientItems(
        query: ClientQueryDto | IStandardizedClientQuery<Course>
    ): Promise<CourseDocument[]> {
        query = this.cvtValidClientFilterQuery(query as ClientQueryDto);
        const { allStages } = this.getClientItemsPipeline(query);
        return this.model.aggregate(allStages);
    }

    async countClientItems(
        query: ClientQueryDto | IStandardizedClientQuery<Course>
    ): Promise<number> {
        query = this.cvtValidClientFilterQuery(query as ClientQueryDto);
        const { nonePaginationStages } = this.getClientItemsPipeline(query);
        const result = await this.model.aggregate([
            ...nonePaginationStages,
            {
                $count: 'n',
            },
        ]);
        return super.handleCountResult(result);
    }

    async fetchBySlug(slug: string): Promise<CourseDocument> {
        const populates = this.getPopulates({ lookupMode: 'detail' });
        return this.courseModel
            .findOne({
                ...this.clientFilter,
                'basicInfo.slug': slug,
            })
            .populate(populates);
    }
    // LATEST
    private getLatestItemsPipeline(query?: FetchOptionsDto) {
        const standardQuery: IStandardizedClientQuery<Course> = {
            limit: query?._limit,
            skip: BaseModel.getSkipValue(query?._page, query?._limit),
            filter: this.clientFilter,
            sort: {
                'history.createdAt': -1,
            },
        };
        return super.getPipelineStagesByClientQuery(standardQuery, undefined, {
            project: this.clientExcerptProjection,
        });
    }

    getLatestItems(query: FetchOptionsDto) {
        const { allStages } = this.getLatestItemsPipeline(query);
        return this.model.aggregate(allStages);
    }

    async countLatestItems() {
        const { nonePaginationStages } = this.getLatestItemsPipeline();
        const result = await this.model.aggregate([
            ...nonePaginationStages,
            {
                $count: 'n',
            },
        ]);
        return super.handleCountResult(result);
    }

    // MOST POPULAR
    private getMostPopularItemsPipeline(query?: FetchOptionsDto) {
        const standardQuery: IStandardizedClientQuery<Course> = {
            limit: query?._limit,
            skip: BaseModel.getSkipValue(query?._page, query?._limit),
            filter: this.clientFilter,
            sort: {
                'meta.ratingCount': -1,
            },
        };
        return super.getPipelineStagesByClientQuery(standardQuery);
    }

    getMostPopularItems(query: FetchOptionsDto) {
        try {
            const { allStages } = this.getMostPopularItemsPipeline(query);
            return this.model.aggregate(allStages);
        } catch (e) {
            return [];
        }
    }

    async countMostPopularItems() {
        const { nonePaginationStages } = this.getMostPopularItemsPipeline();
        const result = await this.model.aggregate([
            ...nonePaginationStages,
            {
                $count: 'n',
            },
        ]);
        return super.handleCountResult(result);
    }

    // HIGHEST RATING
    private getHighestRatingItemsPipeline(query?: FetchOptionsDto) {
        const standardQuery: IStandardizedClientQuery<Course> = {
            limit: query?._limit,
            skip: BaseModel.getSkipValue(query?._page, query?._limit),
            filter: this.clientFilter,
            sort: {
                'meta.avgRatingScore': -1,
            },
        };
        return super.getPipelineStagesByClientQuery(standardQuery);
    }

    getHighestRatingItems(query: FetchOptionsDto) {
        const { allStages } = this.getHighestRatingItemsPipeline(query);
        return this.model.aggregate(allStages);
    }

    async countHighestRatingItems() {
        const { nonePaginationStages } = this.getHighestRatingItemsPipeline();
        const result = await this.model.aggregate([
            ...nonePaginationStages,
            {
                $count: 'n',
            },
        ]);
        return super.handleCountResult(result);
    }

    // GET FILTER DATA
    async countClientFilter(query: ClientQueryDto, fields: string[]): Promise<ICountResult[]> {
        if (fields.length > 0) {
            const validQuery = this.cvtValidClientFilterQuery(query);
            const standardQuery = super.cvtStandardizedQuery(validQuery);
            standardQuery.filter = {
                ...standardQuery.filter,
                ...this.clientFilter,
            };
            const { nonePaginationStages } = super.getPipelineStagesByClientQuery(standardQuery);

            const promises: Promise<ICountResult>[] = [];
            fields.forEach((field) => {
                switch (field) {
                    case '_rating':
                        promises.push(this.countRating(nonePaginationStages));
                        break;
                    case '_duration':
                        {
                            const tempQuery = Helper.lodash.cloneDeep(query) as any;
                            delete tempQuery._duration_filter;
                            const validQuery = this.cvtValidClientFilterQuery(tempQuery);
                            const standardQuery = super.cvtStandardizedQuery(validQuery);
                            standardQuery.filter = {
                                ...standardQuery.filter,
                                ...this.clientFilter,
                            };
                            const { nonePaginationStages } = super.getPipelineStagesByClientQuery(
                                standardQuery
                            );
                            promises.push(this.countDuration(nonePaginationStages));
                        }
                        break;
                    default:
                        const values = this.countDataRecord[field];
                        if (values) {
                            const promise = this.countClientFieldValue(
                                nonePaginationStages,
                                field,
                                values
                            );
                            promises.push(promise);
                        }
                        break;
                }
            });
            const result = (await Promise.all(promises)).filter((item) => !!item);
            return result;
        }
    }

    private cvtValidClientFilterQuery(query: ClientQueryDto) {
        const tempQuery = Helper.lodash.cloneDeep(query) as any;
        // RATING
        if (!!tempQuery._rating_filter) {
            const value = Number.parseFloat(tempQuery._rating_filter);
            tempQuery['meta.avgRatingScore_filter_'] = {
                $gte: value,
            };
            delete tempQuery._rating_filter;
        }

        // DURATION
        if (!!tempQuery._duration_filter) {
            const h = 60 * 60;
            const field = 'meta.contentVideoLength';
            const values = tempQuery._duration_filter
                .split(',')
                .filter((item) => item.trim() != '');
            const durationFilters: any[] = values.map((value) => {
                const [min, max = 100] = value.split('_').map((val) => Number.parseInt(val));
                return {
                    $and: [
                        {
                            [field]: {
                                $gte: min * h,
                            },
                        },
                        {
                            [field]: {
                                $lte: max * h,
                            },
                        },
                    ],
                };
            });
            if (durationFilters.length > 0) {
                if (durationFilters.length == 1) {
                    tempQuery[`$${field}`] = durationFilters[0];
                } else {
                    tempQuery[`$${field}`] = {
                        $or: durationFilters,
                    };
                }
            }
            delete tempQuery._duration_filter;
        }
        return tempQuery;
    }

    private async countRating(inputPipeline: any[]): Promise<ICountResult> {
        const field = 'meta.avgRatingScore';
        const pipeline = this.removeFilterField(inputPipeline, field);
        const [data] = await this.courseModel.aggregate([
            ...pipeline,
            {
                $project: {
                    item: 1,
                    '45_and_up': {
                        $cond: [{ $gte: [`$${field}`, 4.5] }, 1, 0],
                    },
                    '40_and_up': {
                        $cond: [{ $gt: [`$${field}`, 4.0] }, 1, 0],
                    },
                    '35_and_up': {
                        $cond: [{ $gt: [`$${field}`, 3.5] }, 1, 0],
                    },
                    '30_and_up': {
                        $cond: [{ $gt: [`$${field}`, 3.0] }, 1, 0],
                    },
                },
            },
            {
                $group: {
                    _id: '$item',
                    '45': { $sum: '$45_and_up' },
                    '40': { $sum: '$40_and_up' },
                    '35': { $sum: '$35_and_up' },
                    '30': { $sum: '$30_and_up' },
                },
            },
        ]);
        if (data) {
            delete data._id;
            return {
                field: '_rating',
                data,
            };
        }
    }

    private async countDuration(pipeline: any[]): Promise<ICountResult> {
        const h = 60 * 60;
        const field = 'meta.contentVideoLength';
        const genProjectFieldValue = (min: number, max: number) => {
            return {
                $cond: [
                    {
                        $and: [
                            {
                                $gte: [`$${field}`, min],
                            },
                            {
                                $lte: [`$${field}`, max],
                            },
                        ],
                    },
                    1,
                    0,
                ],
            };
        };
        const [data] = await this.courseModel.aggregate([
            ...pipeline,
            {
                $project: {
                    item: 1,
                    '0_1': genProjectFieldValue(0, 1 * h),
                    '1_3': genProjectFieldValue(1 * h, 3 * h),
                    '3_6': genProjectFieldValue(3 * h, 6 * h),
                    '6_17': genProjectFieldValue(6 * h, 17 * h),
                    '17': genProjectFieldValue(17 * h, 100 * h),
                },
            },
            {
                $group: {
                    _id: '$item',
                    '0_1': { $sum: '$0_1' },
                    '1_3': { $sum: '$1_3' },
                    '3_6': { $sum: '$3_6' },
                    '6_17': { $sum: '$6_17' },
                    '17': { $sum: '$17' },
                },
            },
        ]);
        if (data) {
            delete data._id;
            return {
                field: '_duration',
                data,
            };
        }
    }

    private async countClientFieldValue(
        inputOtherPipeline: any[],
        field: string,
        values: string[]
    ): Promise<ICountResult> {
        const otherPipeline = this.removeFilterField(inputOtherPipeline, field);
        const project = { item: 1 };
        const group = { _id: '$item' };
        values.forEach((value) => {
            const tempField = `${value}_code`;
            project[tempField] = {
                $cond: [{ $eq: [`$${field}`, value] }, 1, 0],
            };
            group[value] = {
                $sum: `$${tempField}`,
            };
        });
        const pipeline = [
            ...otherPipeline,
            {
                $project: project,
            },
            {
                $group: group,
            },
        ];
        const [countResult] = await this.model.aggregate(pipeline);
        if (countResult) {
            delete countResult._id;
            const result: ICountResult = {
                field,
                data: countResult,
            };
            return result;
        }
    }

    private get clientFilter() {
        return {
            status: 'active',
        };
    }

    private removeFilterField(pipeline: any[], field: string) {
        const tempPipeline = Helper.lodash.cloneDeep(pipeline);
        const matchIdx = tempPipeline.findIndex((item) => Object.keys(item).indexOf('$match') > -1);
        if (matchIdx > -1) {
            const matchObj = tempPipeline[matchIdx].$match;
            if (matchObj[field]) delete matchObj[field];
            else {
                for (const key in matchObj) {
                    const filterArr = matchObj[key];
                    if (Array.isArray(filterArr)) {
                        const fieldIdx = filterArr.findIndex(
                            (item) => Object.keys(item).indexOf(field) > -1
                        );
                        if (fieldIdx > -1) {
                            filterArr.splice(fieldIdx, 1);
                            break;
                        }
                    }
                }
            }
        }
        return tempPipeline;
    }

    private countDataRecord: ICountData = {
        'basicInfo.level': ['all', 'beginner', 'intermediate', 'expert'],
    };
}
