import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import lodash from 'lodash';
import { Model } from 'mongoose';
import dummy_users from 'src/common/dummy_data/dummy_users';
import { BaseModel } from 'src/common/shared/base-model';
import { ClientQueryDto } from 'src/common/shared/dtos/client-query.dto';
import Helper from 'src/common/utils/helpers/helper.helper';
import UserHelper from 'src/common/utils/helpers/user.helper';
import { Permission } from '../roles/schemas/role.schema';
import { IEmbedOption } from './../../common/shared/base-model';
import { IMomoPaymentExtraData } from './../../common/shared/services/momo.service';
import { TransactionsStatisticService } from './../../features/statistic/services/transactions-statistic.service';
import { UserCourseService } from './../user-course/user-course.service';
import { FavCoursesDto } from './dto/fav-courses.dto';
import { Cart, User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService extends BaseModel<User, UserDocument> {
    protected searchFields: string[] = ['email', 'profile.fullName'];
    protected basicEmbedOptions: IEmbedOption[] = [
        {
            path: 'role',
        },
    ];
    protected detailEmbedOptions: IEmbedOption[] = [...this.basicEmbedOptions];
    protected displayFields: string[] = [
        '_id',
        'email',
        'password',
        'status',
        'role',
        'profile',
        'modifiedAt',
        'providers',
        'refreshToken',
        'myCourses',
        'cart',
        'createdAt',
        'lastLoggon',
        'modifiedAt',
    ];
    protected fileFields: string[] = ['profile.avatar'];

    get dummyData(): any[] {
        return dummy_users;
    }

    async updateById(id: string, data: any) {
        this.autoGenFullName(data);
        return super.updateById(id, data);
    }

    constructor(
        @InjectModel(User.name) protected userModel: Model<UserDocument>,
        protected userCourseService: UserCourseService
    ) {
        super('users', userModel);
    }

    async checkUnique(field: string, value: string): Promise<boolean> {
        const item = await this.findOne({
            [field]: value,
            status: {
                $ne: 'unverified',
            },
        });
        return !!item;
    }

    //
    async getAuthUserByRefreshToken(refreshToken: string): Promise<User> {
        const user = await this.model.findOne({ status: 'active', refreshToken });
        if (user) {
            return this.getAuthUserById(user._id);
        }
        return null;
    }

    async getAuthUserByEmail(email: string): Promise<User> {
        const tempUser = await this.userModel.findOne({ email });
        const user = await this.getAuthUserById(tempUser._id);
        return user;
    }

    async getAuthUserById(id: string): Promise<User> {
        const user = await this.model
            .findById(id, {
                email: 1,
                profile: 1,
                role: 1,
                refreshToken: 1,
            })
            .populate([
                {
                    path: 'role',
                    populate: {
                        path: 'permissions.documentPermission',
                        select: {
                            _id: 0,
                            name: 1,
                        },
                    },
                    select: {
                        name: 1,
                        permissions: 1,
                    },
                },
            ])
            .lean()
            .exec();
        if (user) {
            user.role.permissions = user.role.permissions.map((item) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { _id, onlyForCreator, ...props } = item;
                if (onlyForCreator) {
                    (props as any).onlyForCreator = true;
                }
                return props;
            }) as Permission[];
        }
        return user;
    }

    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.findOne({ email });
    }
    async findByEmailAndPassword(email: string, password: string): Promise<UserDocument | null> {
        return this.findOne({ email, password });
    }
    //
    async create(data: any): Promise<UserDocument> {
        this.autoGenFullName(data);
        return super.create(data);
    }

    //
    async loginWithEmailAndPassword(email: string, password: string): Promise<User | null> {
        // const populates = this.getPopulates({ lookupMode: 'detail' })
        const user = await this.model.findOneAndUpdate(
            {
                email,
                password,
                status: 'active',
            },
            {
                $set: {
                    refreshToken: Helper.genRandomHash(),
                    lastLoggon: new Date().toISOString(),
                },
            }
        );
        if (user) {
            const authUser = await this.getAuthUserById(user._id);
            return authUser;
        }
        return null;
    }

    async loginWithEmail(email: string): Promise<UserDocument | null> {
        const populates = this.getPopulates({ lookupMode: 'detail' });
        return this.userModel
            .findOneAndUpdate(
                { email },
                {
                    $set: {
                        refreshToken: Helper.genRandomHash(),
                        lastLoggon: new Date().toISOString(),
                    },
                },
                {
                    new: true,
                }
            )
            .populate(populates);
    }
    //
    async updateCart(userId: string, courseIds: string[]) {
        return this.userModel.updateOne(
            { _id: userId },
            {
                $set: {
                    'cart.courses': courseIds,
                },
            }
        );
    }
    async addCourseToCart(userId: string, courseId: string) {
        const item = await this.userModel.findById(userId);
        if (item) {
            const exist = item.cart.courses.find((item) => item.toString() == courseId);
            if (!exist) {
                item.cart.courses.push(courseId as any);
                await item.save();
            }
        }
    }
    async deleteCourseInCart(userId: string, courseId: string) {
        const item = await this.userModel.findById(userId);
        if (item) {
            item.cart.courses = item.cart.courses.filter((item) => item.toString() != courseId);
            await item.save();
        }
    }
    async handleCheckout(data: IMomoPaymentExtraData, date?: Date) {
        const userCourseIds = await this.userCourseService.createUserCourses(
            data.userId,
            data.courses,
            date
        );
        return this.userModel.findOneAndUpdate(
            { _id: data.userId },
            {
                cart: { courses: [] },
                $push: {
                    'myCourses.learning': userCourseIds,
                },
            } as Partial<User>,
            { new: true }
        );
    }
    // ME
    async fetchCart(userId: string): Promise<Cart> {
        const doc = await this.userModel
            .findById(userId)
            .select({
                cart: 1,
            })
            .populate({
                path: 'cart.courses',
                select: {
                    basicInfo: 1,
                    promotions: 1,
                    meta: 1,
                },
            });
        if (doc) return doc.cart;
    }

    async fetchWishlist(userId: string) {
        const doc = await this.userModel
            .findById(userId)
            .select({
                'myCourses.wishlist': 1,
            })
            .populate({
                path: 'myCourses.wishlist',
            });
        if (doc) return doc.myCourses.wishlist;
    }

    async countWishlist(userId: string) {
        const doc = await this.userModel.findById(userId).select({
            'myCourses.wishlist': 1,
        });
        if (doc) return doc.myCourses.wishlist.length;
    }

    async fetchWishlistIds(userId: string) {
        const doc = await this.userModel.findById(userId).select({
            'myCourses.wishlist': 1,
        });
        if (doc) return doc.myCourses.wishlist;
    }

    async checkCartValidForCheckout(userId: string) {
        const user = await this.userModel.findById(userId).populate([
            {
                path: 'myCourses.learning',
                select: {
                    course: 1,
                },
            },
            {
                path: 'cart.courses',
                select: {
                    status: 1,
                },
            },
        ]);
        if (user) {
            // check all course active
            for (const item of user.cart.courses) {
                if (item.status != 'active') {
                    return false;
                }
            }
            // check
            const learningCourseIds = await this.userCourseService.fetchLearningCourseIds(userId);
            const courseIds = user.cart.courses.map((item) => item._id.toString());
            const intersection = Helper.lodash.intersection(learningCourseIds, courseIds);
            return intersection.length == 0;
        }
        return false;
    }
    //

    // wishlist
    async addToWishlist(userId: string, data: FavCoursesDto) {
        const ids = data.courseIds;
        const result = await this.userModel.updateOne(
            {
                _id: userId,
                'myCourses.wishlist': {
                    $nin: ids,
                },
            },
            {
                $addToSet: {
                    'myCourses.wishlist': ids,
                },
            }
        );
        return result;
    }

    async deleteFromWishlist(userId: string, data: FavCoursesDto) {
        const ids = data.courseIds;
        const result = await this.userModel.updateOne(
            {
                _id: userId,
                'myCourses.wishlist': {
                    $in: ids,
                },
            },
            {
                $pullAll: {
                    'myCourses.wishlist': ids,
                },
            }
        );
        return result;
    }

    // INSTRUCTORS
    private getInstructorsPipeline(query: ClientQueryDto) {
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
    //
    async getInstructors(query: ClientQueryDto): Promise<User[]> {
        const standardQuery = this.cvtStandardizedQuery(query);
        let pipeline = this.getInstructorsPipeline(query);
        pipeline = pipeline.concat([
            // TOTAL COURSES
            {
                $lookup: {
                    from: 'courses',
                    let: {
                        user: '$_id',
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: [`$$user`, `$history.createdBy`],
                                        },
                                        {
                                            $eq: [`$status`, `active`],
                                        },
                                    ],
                                },
                            },
                        },
                        {
                            $group: {
                                _id: 1,
                                value: {
                                    $sum: 1,
                                },
                            },
                        },
                    ],
                    as: 'totalCourse',
                },
            },
            {
                $unwind: {
                    path: '$totalCourse',
                    preserveNullAndEmptyArrays: true,
                },
            },
            // TOTAL REVENUE
            {
                $lookup: {
                    from: 'usercourses',
                    let: {
                        user: '$_id',
                    },
                    pipeline: [
                        ...super.getLookup({
                            from: 'courses',
                            localField: 'course',
                            project: {
                                basicInfo: 1,
                                meta: 1,
                                history: 1,
                            },
                            lookupOne: true,
                        }),
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$course.history.createdBy', '$$user'],
                                },
                            },
                        },
                        {
                            $group: {
                                _id: 1,
                                totalRevenue: {
                                    $sum: {
                                        $multiply: [
                                            '$salePrice',
                                            TransactionsStatisticService.getCommissionRate(true),
                                        ],
                                    },
                                },
                                totalEnrollment: {
                                    $sum: 1,
                                },
                                courseRating: {
                                    $avg: '$course.meta.avgRatingScore',
                                },
                            },
                        },
                    ],
                    as: 'meta',
                },
            },
            {
                $unwind: {
                    path: '$meta',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    email: 1,
                    status: 1,
                    profile: 1,
                    createdAt: 1,
                    meta: {
                        totalCourse: '$totalCourse.value',
                        totalRevenue: '$meta.totalRevenue',
                        totalEnrollment: '$meta.totalEnrollment',
                        courseRating: '$meta.courseRating',
                    },
                },
            },
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
    //
    async countInstructors(query: ClientQueryDto): Promise<number> {
        const pipeline = this.getInstructorsPipeline(query);
        const result = await this.model.aggregate([
            ...pipeline,
            {
                $count: 'n',
            },
        ]);
        return super.handleCountResult(result);
    }

    private autoGenFullName(data: any): void {
        if (!data.profile?.fullName && !!data.profile?.firstName && !!data.profile?.lastName) {
            lodash.set(
                data,
                'profile.fullName',
                UserHelper.genFullName(data.profile.firstName, data.profile.lastName)
            );
        }
        return data;
    }

    updateLastLoggonById(id: string) {
        return this.userModel
            .updateOne({ _id: id }, { $set: { lastLoggon: new Date().toISOString() } })
            .exec();
    }
}
