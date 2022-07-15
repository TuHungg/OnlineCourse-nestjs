import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import dummy_reviews from 'src/common/dummy_data/dummy_reviews';
import { BaseModel, IEmbedOption } from 'src/common/shared/base-model';
import Helper from 'src/common/utils/helpers/helper.helper';
import CourseFilterDto from '../../users/dto/course-filter.dto';
import { TotalDataOptionsDto } from '../../users/dto/total-data-options.dto';
import { UpdateReviewResponseDto } from '../dto/update-review-response.dto';
import { Response, Review, ReviewDocument } from '../schemas/review.schema';

@Injectable()
export class ReviewsService extends BaseModel<Review, ReviewDocument> {
    protected basicEmbedOptions: IEmbedOption[] = [
        {
            path: 'user',
            collection: 'users',
        },
    ];
    //
    protected displayFields: string[] = ['_id', 'content', 'user', 'timestamps', 'rating'];
    //
    get dummyData(): any[] {
        return dummy_reviews;
    }

    constructor(@InjectModel(Review.name) protected reviewModel: Model<ReviewDocument>) {
        super('reviews', reviewModel);
    }

    async updateReviewRespond(
        instructorId: string,
        reviewId: string,
        data: UpdateReviewResponseDto
    ) {
        const updateData = Helper.cvtDotObj({
            response: {
                user: instructorId as any,
                content: data.content,
                timestamp: new Date().toISOString(),
            } as Response,
        });
        const result = await this.model.updateOne(
            {
                _id: reviewId,
            },
            updateData,
            {
                new: true,
            }
        );
        return result;
    }
    async deleteReviewRespond(instructorId: string, reviewId: string) {
        const result = await this.model.updateOne(
            {
                _id: reviewId,
                'response.user': instructorId,
            },
            {
                $unset: {
                    response: '',
                },
            }
        );
        return result;
    }
    protected get userLookup() {
        return super.getLookup({
            from: 'users',
            localField: 'user',
            project: {
                profile: 1,
                email: 1,
            },
        });
    }

    protected get respondedUserLookup() {
        return [
            ...super.getLookup({
                from: 'users',
                localField: 'response.user',
                project: {
                    profile: 1,
                    email: 1,
                },
                as: 'respondedUser',
            }),
            {
                $unwind: {
                    path: '$respondedUser',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $addFields: {
                    'response.user': '$respondedUser',
                },
            },
            {
                $project: {
                    respondedUser: 0,
                },
            },
        ];
    }

    async fetchTotalCourseRating(data: TotalDataOptionsDto, instructorId?: string) {
        const pipeline = [
            ...this.getAvgPreprocessPipeline(data, instructorId),
            {
                $count: 'n',
            },
        ];
        const result = await this.model.aggregate(pipeline);
        return super.handleCountResult(result);
    }

    async fetchAvgRatings(data: TotalDataOptionsDto, instructorId?: string) {
        const pipeline = [
            ...this.getAvgPreprocessPipeline(data, instructorId),
            {
                $group: {
                    _id: 1,
                    avg: {
                        $avg: '$rating',
                    },
                },
            },
        ];
        const result = await this.model.aggregate(pipeline);
        return result[0]?.avg || 0;
    }

    protected getAvgPreprocessPipeline(data: TotalDataOptionsDto, instructorId?: string) {
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
            matchPipeline[0].$match['course.history.createdBy'] = Helper.cvtObjectId(instructorId);
        }
        if (minDate) {
            matchPipeline[0].$match['timestamps.createdAt'] = {
                $gte: minDate.toISOString(),
            };
        }
        if (data['course._id_filter'])
            matchPipeline[0].$match['course._id'] = Helper.cvtObjectId(data['course._id_filter']);

        const pipeline = [
            // lookup course
            ...super.getLookup({
                from: 'courses',
                localField: 'course',
                project: {
                    basicInfo: 1,
                    history: 1,
                },
                lookupOne: true,
            }),
            // match course belong to instructor
            ...matchPipeline,
            // convert date string to date
        ];
        return pipeline;
    }

    async fetchInstructorCourseRatingStats(data: CourseFilterDto, instructorId?: string) {
        const pipeline = [
            ...this.getStatsPreprocessPipeline(data, instructorId),
            {
                $group: {
                    _id: {
                        $floor: '$rating',
                    },
                    count: {
                        $sum: 1,
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    rating: '$_id',
                    count: 1,
                },
            },
        ];
        const result = await this.model.aggregate(pipeline);
        return result;
    }

    protected getStatsPreprocessPipeline(data: CourseFilterDto, instructorId?: string) {
        const matchPipeline = [
            {
                $match: {},
            },
        ];

        if (instructorId) {
            matchPipeline[0].$match['course.history.createdBy'] = Helper.cvtObjectId(instructorId);
        }
        if (data['course._id_filter'])
            matchPipeline[0].$match['course._id'] = Helper.cvtObjectId(data['course._id_filter']);

        const pipeline = [
            // lookup course
            ...super.getLookup({
                from: 'courses',
                localField: 'course',
                project: {
                    basicInfo: 1,
                    history: 1,
                },
                lookupOne: true,
            }),
            // match course belong to instructor
            ...matchPipeline,
            // convert date string to date
        ];
        return pipeline;
    }

    getUserRating(userId: string, courseId: string) {
        return this.reviewModel.findOne({ user: userId, course: courseId });
    }
}
