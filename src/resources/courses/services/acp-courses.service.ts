import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClientQueryDto } from 'src/common/shared/dtos/client-query.dto';
import { CoursesService } from 'src/resources/courses/services/courses.service';
import { Course, CourseDocument } from '../schemas/course.schema';
@Injectable()
export default class AcpCoursesService extends CoursesService {
    constructor(@InjectModel(Course.name) protected courseModel: Model<CourseDocument>) {
        super(courseModel);
    }
    // ACTIVE COURSES
    private getActiveCoursesQuery(query: ClientQueryDto) {
        const standardQuery = this.cvtStandardizedQuery(query);
        return standardQuery;
    }
    //
    async fetchActiveCourses(query: ClientQueryDto): Promise<Course[]> {
        const standardQuery = this.getActiveCoursesQuery(query);
        const result = await this.model.aggregate([
            {
                $match: {
                    status: 'active',
                },
            },
            ...super.getLookup({
                from: 'users',
                localField: 'history.createdBy',
                lookupOne: true,
                project: {
                    email: 1,
                    profile: 1,
                },
            }),
            ...super.getLookup({
                from: 'usercourses',
                foreignField: 'course',
                localField: '_id',
                as: 'students',
                lookupOne: false,
            }),
            {
                $lookup: {
                    from: 'usercourses',
                    let: {
                        course: '$_id',
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: [`$$course`, `$course`],
                                },
                            },
                        },
                        {
                            $group: {
                                _id: 1,
                                value: {
                                    $sum: '$salePrice',
                                },
                            },
                        },
                    ],
                    as: 'totalSales',
                },
            },
            {
                $unwind: {
                    path: '$totalSales',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    basicInfo: 1,
                    meta: 1,
                    status: 1,
                    history: 1,
                    totalSales: {
                        $cond: [
                            {
                                $gt: ['$totalSales', 0],
                            },
                            '$totalSales.value',
                            0,
                        ],
                    },
                    // totalSales: { $sum: '$salePrice' },
                    numStudent: { $size: '$students' },
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
        return result;
    }
    //
    async countActiveCourses(query: ClientQueryDto): Promise<number> {
        const standardQuery = this.getActiveCoursesQuery(query);
        const result = await this.model.aggregate([
            {
                $match: standardQuery.filter,
            },
            {
                $count: 'n',
            },
        ]);
        return super.handleCountResult(result);
    }
}
