import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
/*
https://docs.nestjs.com/providers#services
*/
import { Model } from 'mongoose';
import dummy_user_course from 'src/common/dummy_data/dummy_user_course';
import { BaseModel, IEmbedOption } from 'src/common/shared/base-model';
import { ClientQueryDto } from 'src/common/shared/dtos/client-query.dto';
import { MomoService } from 'src/common/shared/services/momo.service';
import Helper from 'src/common/utils/helpers/helper.helper';
import {
    Archived,
    LearnUnit,
    UserCourse,
    UserCourseDocument,
} from '../user-course/schemas/user_course.schema';
import { IMomoPaymentCourse } from './../../common/shared/services/momo.service';
import { Course, CourseDocument } from './../courses/schemas/course.schema';
import { ArchiveCoursesDto } from '../users/dto/archive-courses.dto';
import { UpdateLearnUnitDto } from './dto/update-learn-unit-dto';
import { LearnUnitDocument } from './schemas/user_course.schema';

@Injectable()
export class UserCourseService extends BaseModel<UserCourse, UserCourseDocument> {
    get dummyData(): any[] {
        return dummy_user_course;
    }

    protected detailEmbedOptions: IEmbedOption[] = [
        ...this.basicEmbedOptions,
        {
            path: 'course',
            populate: [
                {
                    path: 'details.sections.units.lecture',
                    collection: 'lectures',
                    populate: [
                        {
                            path: 'video',
                        },
                        {
                            path: 'resources',
                        },
                    ],
                },
                {
                    path: 'details.sections.units.quiz',
                    collection: 'quizzes',
                },
            ],
        },
    ];
    constructor(
        @InjectModel(UserCourse.name)
        private readonly userCourseModel: Model<UserCourseDocument>,
        @InjectModel(Course.name)
        private readonly courseModel: Model<CourseDocument>
    ) {
        super('usercourses', userCourseModel);
    }

    // FETCHES
    async fetchItemBySlug(userId: string, courseSlug: string): Promise<UserCourseDocument> {
        const course = await this.courseModel.findOne({
            'basicInfo.slug': courseSlug,
        });
        if (!!course) {
            const populates = this.getPopulates({ lookupMode: 'detail' });
            const item = await this.userCourseModel
                .findOne({
                    $and: [{ user: userId }, { course: course._id }],
                })
                .populate(populates);
            if (!!item) return item;
            else if (course.history.createdBy.toString() == userId.toString()) {
                await this.createUserCourse({
                    userId,
                    courseId: course._id,
                });
                return this.fetchItemBySlug(userId, courseSlug);
            }
        }
        return null;
    }
    //
    async fetchItem(userId: string, courseId: string): Promise<UserCourseDocument> {
        const populates = this.getPopulates({ lookupMode: 'detail' });
        const item = await this.userCourseModel
            .findOne({
                $and: [{ user: userId }, { course: courseId }],
            })
            .populate(populates);
        return item;
    }
    //
    async fetchLearningCourses(userId: string): Promise<UserCourseDocument[]> {
        const items = await this.model
            .find({
                user: userId,
                'archived.isArchived': false,
            })
            .populate({
                path: 'course',
                select: {
                    basicInfo: 1,
                },
            })
            .sort({
                'timestamps.createdAt': -1,
            });
        return items;
    }
    //
    async fetchArchivedCourses(userId: string): Promise<UserCourseDocument[]> {
        const items = await this.model
            .find({
                user: userId,
                'archived.isArchived': true,
            })
            .populate({
                path: 'course',
                select: {
                    basicInfo: 1,
                },
            })
            .sort({
                'archived.timestamp': -1,
            });
        return items;
    }
    //
    async fetchLearningCourseIds(userId: string): Promise<string[]> {
        const items = await this.model.find(
            {
                user: userId,
            },
            {
                course: 1,
            }
        );
        return items.map((item) => item.course as unknown as string);
    }
    //
    archiveCourses(userId: string, data: ArchiveCoursesDto) {
        const updateData = Helper.cvtDotObj({
            archived: {
                isArchived: true,
                timestamp: new Date().toISOString(),
            } as Archived,
        });
        return this.userCourseModel.updateMany(
            {
                user: userId,
                _id: {
                    $in: data.userCourseIds,
                },
                'archived.isArchived': false,
            },
            updateData
        );
    }
    //
    unarchiveCourses(userId: string, data: ArchiveCoursesDto) {
        const updateData = Helper.cvtDotObj({
            archived: {
                isArchived: false,
            } as Archived,
        });
        return this.userCourseModel.updateMany(
            {
                user: userId,
                _id: {
                    $in: data.userCourseIds,
                },
                'archived.isArchived': true,
            },
            {
                ...updateData,
                $unset: {
                    'archived.timestamp': '',
                },
            }
        );
    }
    //
    async completedUnit(id: string, unitId: string) {
        const item = await this.userCourseModel.findById(id).populate({ path: 'course' });
        if (item) {
            const existLearnUnit = item.learnDetail.learnUnits.find(
                (item) => item.unitId == unitId
            );
            if (existLearnUnit) {
                existLearnUnit.isCompleted = true;
                item.learnDetail.progress = this.calculateProgress(item);
                await item.save();
                return existLearnUnit;
            } else {
                const learnUnitData: LearnUnit = {
                    isCompleted: true,
                    unitId,
                };
                item.learnDetail.learnUnits.push(learnUnitData as LearnUnitDocument);
                item.learnDetail.progress = this.calculateProgress(item);
                await item.save();
                const lastItem = item.learnDetail.learnUnits.at(
                    item.learnDetail.learnUnits.length - 1
                );
                return lastItem;
            }
        }
    }
    //
    async uncompletedUnit(id: string, unitId: string) {
        const item = await this.userCourseModel.findById(id).populate({ path: 'course' });
        if (item) {
            const existLearnUnit = item.learnDetail.learnUnits.find(
                (item) => item.unitId == unitId
            );
            if (existLearnUnit) {
                existLearnUnit.isCompleted = false;
                item.learnDetail.progress = this.calculateProgress(item);
                await item.save();
                return existLearnUnit;
            } else {
                const learnUnitData: LearnUnit = {
                    isCompleted: false,
                    unitId,
                };
                item.learnDetail.learnUnits.push(learnUnitData as LearnUnitDocument);
                item.learnDetail.progress = this.calculateProgress(item);
                await item.save();
                const lastItem = item.learnDetail.learnUnits.at(
                    item.learnDetail.learnUnits.length - 1
                );
                return lastItem;
            }
        }
    }
    //
    private calculateProgress(item: UserCourseDocument) {
        const nCompletedUnit = item.learnDetail.learnUnits.reduce((prev, current) => {
            return prev + (current.isCompleted ? 1 : 0);
        }, 0);
        const nUnit = item.course.details.sections?.reduce((prev, current) => {
            return prev + current.units.length;
        }, 0);
        const progress = nCompletedUnit / nUnit;
        return progress;
    }
    //
    async createUserCourses(userId: string, courses: IMomoPaymentCourse[], date?: Date) {
        const userCourses = await Promise.all(
            courses.map((course) => {
                return this.createUserCourse({
                    userId,
                    courseId: course._id,
                    salePrice: course.salePrice,
                    date,
                });
            })
        );
        return userCourses;
    }

    async createUserCourse(options: {
        userId: string;
        courseId: string;
        salePrice?: number;
        date?: Date;
    }) {
        // eslint-disable-next-line prefer-const
        let { userId, courseId, salePrice = 0, date } = options;
        return super.create({
            salePrice: MomoService.getSalePrice(salePrice),
            user: userId,
            course: courseId,
            timestamps: {
                createdAt: date ? date.toISOString() : undefined,
            },
        });
    }

    //
    async fetchLearnUnit(userCourseId: string, unitId: string) {
        const result = await this.model
            .findOne(
                {
                    _id: userCourseId,
                    'learnDetail.learnUnits.unitId': unitId,
                },
                {
                    'learnDetail.learnUnits.$': 1,
                }
            )
            .populate({
                path: 'learnDetail.learnUnits.learnQuiz.quiz',
            });
        const doc = result ? result.learnDetail.learnUnits[0] : result;
        return doc;
    }
    //
    async updateLearnUnit(userCourseId: string, unitId: string, data: UpdateLearnUnitDto) {
        // prepare data
        const updateDotObj = Helper.cvtDotObj({
            learnDetail: {
                learnUnits: {
                    $: data,
                },
            },
        });

        // update
        const result = await this.userCourseModel.updateOne(
            {
                _id: userCourseId,
                'learnDetail.learnUnits.unitId': unitId,
            },
            updateDotObj
        );

        // check match
        if (result.matchedCount == 0) {
            //add
            await this.userCourseModel.updateOne({
                _id: userCourseId,
                $push: {
                    'learnDetail.learnUnits': {
                        unitId,
                        ...data,
                    },
                },
            });
        }

        // return new value
        const item = await this.fetchLearnUnit(userCourseId, unitId);
        return item;
    }
    //
    private getStudentsStandardizeQuery(userId: string, query: ClientQueryDto) {
        const standardQuery = super.cvtStandardizedQuery(query);
        return standardQuery;
    }
    //
    async fetchStudents(userId: string, query: ClientQueryDto) {
        const standardQuery = this.getStudentsStandardizeQuery(userId, query);
        const result = await this.model.aggregate([
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
                        { $project: { history: 1 } },
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
            {
                $group: {
                    _id: '$user',
                    user: {
                        $first: '$user',
                    },
                    timestamps: {
                        $first: '$timestamps',
                    },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    let: { user: '$user' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$$user', '$_id'],
                                },
                            },
                        },
                        {
                            $project: {
                                profile: 1,
                                email: 1,
                            },
                        },
                    ],
                    as: 'user',
                },
            },
            {
                $unwind: '$user',
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
        return result;
    }
    //
    async countStudents(userId: string, query: ClientQueryDto) {
        const standardQuery = this.getStudentsStandardizeQuery(userId, query);
        const result = await this.model
            .aggregate([
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
                            { $project: { history: 1 } },
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
                {
                    $group: {
                        _id: '$user',
                    },
                },
                {
                    $count: 'n',
                },
            ])
            .exec();
        return this.handleCountResult(result);
    }
}
