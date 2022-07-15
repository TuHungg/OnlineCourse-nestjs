import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import lodash from 'lodash';
import { Model } from 'mongoose';
import { ClientQueryDto } from 'src/common/shared/dtos/client-query.dto';
import Helper from 'src/common/utils/helpers/helper.helper';
import { CoursesService } from 'src/resources/courses/services/courses.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { Review, ReviewDocument } from '../schemas/review.schema';
import { ReviewsService } from './reviews.service';

@Injectable()
export class CourseReviewsService extends ReviewsService {
    constructor(
        @InjectModel(Review.name) protected reviewModel: Model<ReviewDocument>,
        private coursesService: CoursesService
    ) {
        super(reviewModel);
    }
    //
    private getCourseReviewsPipelines(courseId: string, query: ClientQueryDto) {
        if (query.rating_filter) {
            query.rating_filter = Number.parseInt(query.rating_filter);
        }
        const standardQuery = super.cvtStandardizedQuery(query);
        standardQuery.sort = {
            'timestamps.createdAt': -1,
        };
        return [
            {
                $match: {
                    ...standardQuery.filter,
                    course: Helper.cvtObjectId(courseId),
                },
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
            ...this.userLookup,
            ...this.respondedUserLookup,
        ];
    }
    //
    fetchCourseReviews(courseId: string, query: ClientQueryDto) {
        const pipeline = this.getCourseReviewsPipelines(courseId, query);
        return this.reviewModel.aggregate(pipeline);
    }
    //
    async countCourseReviews(courseId: string, query: ClientQueryDto) {
        const standardQuery = super.cvtStandardizedQuery(query);
        return this.model.count({ ...standardQuery.filter, course: courseId });
    }
    //
    private getInstructorCourseReviewsPipelines(userId: string, query: ClientQueryDto) {
        const standardQuery = super.cvtStandardizedQuery(query);
        const courseId = query['course._id_filter'];
        let nonePaginationPipelines = [];
        if (!!courseId) {
            nonePaginationPipelines = nonePaginationPipelines.concat([
                {
                    $match: {
                        course: Helper.cvtObjectId(courseId),
                    },
                },
            ]);
        } else {
            nonePaginationPipelines = nonePaginationPipelines.concat();
        }
        nonePaginationPipelines = nonePaginationPipelines.concat([
            {
                $lookup: {
                    from: 'courses',
                    let: { course: '$course' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$$course', '$_id'] },
                            },
                        },
                        {
                            $project: {
                                basicInfo: 1,
                                meta: 1,
                                history: 1,
                            },
                        },
                    ],
                    as: 'course',
                },
            },
            {
                $unwind: '$course',
            },
            {
                $match: {
                    ...standardQuery.filter,
                    'course.history.createdBy': Helper.cvtObjectId(userId),
                },
            },
        ]);

        let allPipelines = nonePaginationPipelines.concat([
            {
                $sort: {
                    'timestamps.createdAt': -1,
                },
            },
            {
                $skip: standardQuery.skip,
            },
            {
                $limit: standardQuery.limit,
            },
            ...this.userLookup,
            ...this.respondedUserLookup,
        ]);
        if (!!courseId) {
            allPipelines = allPipelines.concat([
                {
                    $project: {
                        course: 0,
                    },
                },
            ]);
        }
        return {
            nonePagination: nonePaginationPipelines,
            all: allPipelines,
        };
    }
    //
    async fetchInstructorCourseReviews(userId: string, query: ClientQueryDto) {
        const { all } = this.getInstructorCourseReviewsPipelines(userId, query);
        const result = await this.model.aggregate(all);
        return result;
    }
    //
    async countInstructorCourseReviews(userId: string, query: ClientQueryDto) {
        const { nonePagination } = this.getInstructorCourseReviewsPipelines(userId, query);
        const result = await this.model.aggregate([
            ...nonePagination,
            {
                $count: 'n',
            },
        ]);
        return super.handleCountResult(result);
    }

    async getAvgCourseRatingScore(courseId: string) {
        const result = await this.model.aggregate([
            {
                $match: {
                    course: Helper.cvtObjectId(courseId),
                },
            },
            {
                $group: {
                    _id: '$course',
                    value: {
                        $avg: '$rating',
                    },
                },
            },
        ]);
        if (result.length > 0) {
            return result.at(0).value;
        }
        return 0;
    }

    async addUserReview(userId: string, data: CreateReviewDto) {
        lodash.set(data, 'user', userId);
        const addResult = await this.create(data);
        const avg = await this.getAvgCourseRatingScore(data.course);
        this.coursesService.model
            .updateOne(
                {
                    _id: data.course,
                },
                {
                    $set: {
                        'meta.avgRatingScore': avg,
                    },
                    $inc: {
                        'meta.ratingCount': 1,
                    },
                }
            )
            .exec();
        return addResult;
    }

    async deleteUserReview(reviewId: string) {
        const deletedReview = await super.deleteById(reviewId);
        const avg = await this.getAvgCourseRatingScore(deletedReview.course as any);
        this.coursesService.model
            .updateOne(
                {
                    _id: deletedReview.course,
                },
                {
                    $set: {
                        'meta.avgRatingScore': avg,
                    },
                    $inc: {
                        'meta.ratingCount': -1,
                    },
                }
            )
            .exec();
        return deletedReview;
    }

    async updateUserReview(userId: string, courseId: string, data: UpdateReviewDto) {
        this.attachHistoryData(data, 'update');
        const dotData = Helper.cvtDotObj(data);
        const updateReusult = await this.reviewModel.updateOne(
            { user: userId, course: courseId },
            {
                $set: dotData,
            }
        );
        const avg = await this.getAvgCourseRatingScore(courseId);
        this.coursesService.model
            .updateOne(
                {
                    _id: courseId,
                },
                {
                    $set: {
                        'meta.avgRatingScore': avg,
                    },
                }
            )
            .exec();
        return updateReusult;
    }
}
