import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import update from 'immutability-helper';
import { Model } from 'mongoose';
import { ClientQueryDto } from 'src/common/shared/dtos/client-query.dto';
import Helper from 'src/common/utils/helpers/helper.helper';
import { CoursesService } from 'src/resources/courses/services/courses.service';
import { Course, CourseDocument } from '../schemas/course.schema';
@Injectable()
export default class InstructorCoursesService extends CoursesService {
    constructor(@InjectModel(Course.name) protected courseModel: Model<CourseDocument>) {
        super(courseModel);
    }

    private getInstructorCoursesStandardQuery(userId: string, query: ClientQueryDto) {
        let standardQuery = super.cvtStandardizedQuery(query);
        standardQuery = update(standardQuery, {
            filter: {
                $merge: {
                    'history.createdBy': Helper.cvtObjectId(userId),
                },
            },
        });
        return standardQuery;
    }

    async fetchCourses(userId: string, query: ClientQueryDto) {
        const standardQuery = this.getInstructorCoursesStandardQuery(userId, query);
        const result = await this.model.aggregate([
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
            {
                $lookup: {
                    from: 'users',
                    let: { courseId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ['$$courseId', '$myCourses.wishlist'],
                                },
                            },
                        },
                    ],
                    as: 'studentLoved',
                },
            },
            {
                $lookup: {
                    from: 'usercourses',
                    foreignField: 'course',
                    localField: '_id',
                    as: 'students',
                },
            },
            {
                $project: {
                    basicInfo: 1,
                    meta: 1,
                    status: 1,
                    history: 1,
                    numStudentLoved: { $size: '$studentLoved' },
                    numStudent: { $size: '$students' },
                },
            },
        ]);
        return result;
    }

    async countCourses(userId: string, query: ClientQueryDto) {
        const standardQuery = this.getInstructorCoursesStandardQuery(userId, query);
        const count = await this.model.count(standardQuery.filter);
        return count;
    }
}
