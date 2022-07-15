import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import fs from 'fs';
import { Model } from 'mongoose';
import dummy_courses from 'src/common/dummy_data/dummy_courses';
import { BaseModel } from 'src/common/shared/base-model';
import Helper from 'src/common/utils/helpers/helper.helper';
import { IEmbedOption } from '../../../common/shared/base-model';
import { Course, CourseDocument } from '../schemas/course.schema';
import { IMomoPaymentExtraData } from './../../../common/shared/services/momo.service';

@Injectable()
export class CoursesService extends BaseModel<Course, CourseDocument> {
    private dummyCoursesDirPath = 'src/common/dummy_data/courses';
    //
    protected searchFields: string[] = ['basicInfo.title'];
    //
    protected basicEmbedOptions: IEmbedOption[] = [
        {
            path: 'history.createdBy',
            collection: 'users',
        },
        {
            path: 'categories',
        },
        {
            path: 'topics',
        },
    ];
    //
    protected detailEmbedOptions: IEmbedOption[] = [
        ...this.basicEmbedOptions,
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
    ];
    //
    protected displayFields: string[] = [
        '_id',
        'status',
        'categories',
        'topics',
        'reviews',
        'basicInfo',
        'details',
        'meta',
        'messages',
        'history',
        'promotions',
    ];
    //
    protected fileFields: string[] = ['basicInfo.image'];
    //

    //
    get dummyData(): any[] {
        return dummy_courses;
    }
    // async transformDummy() {
    //     const paths = fs.readdirSync(this.dummyCoursesDirPath);
    //     paths.forEach((dirPath) => {
    //         const filePath = `${this.dummyCoursesDirPath}/${dirPath}`;
    //         const rawJson = fs.readFileSync(filePath);
    //         const courses = JSON.parse(rawJson.toString());
    //         const tempObj = {};
    //         courses.forEach((course) => {
    //             tempObj[course.basicInfo.slug] = course;
    //         });
    //         fs.writeFileSync(filePath, JSON.stringify(Object.values(tempObj)));
    //     });
    // }

    async transformDummy() {
        const paths = fs.readdirSync(this.dummyCoursesDirPath);
        paths.forEach((dirPath) => {
            const filePath = `${this.dummyCoursesDirPath}/${dirPath}`;
            const rawJson = fs.readFileSync(filePath);
            let courses = JSON.parse(rawJson.toString());
            courses = courses.map((course) => {
                const item = course as Course;
                const createdDate = new Date(item.history.createdAt);
                createdDate.setDate(createdDate.getDate() + 3);
                item.history.publishedAt = createdDate.toISOString();
                return item;
            });
            fs.writeFileSync(filePath, JSON.stringify(courses));
        });
    }

    async reset(): Promise<CourseDocument[]> {
        const dummyItems = await super.reset();
        const files = fs.readdirSync(this.dummyCoursesDirPath);
        let items = [];
        files.forEach((file) => {
            const rawJson = fs.readFileSync(`${this.dummyCoursesDirPath}/${file}`);
            const json = JSON.parse(rawJson.toString());
            items = items.concat(json);
        });
        const insertedData = await this.courseModel.insertMany(items);
        return dummyItems.concat(insertedData);
    }

    test() {
        return this.courseModel.aggregate([
            {
                $group: {
                    _id: '$meta.contentVideoLength',
                    count: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
        ]);
    }

    constructor(@InjectModel(Course.name) protected courseModel: Model<CourseDocument>) {
        super('courses', courseModel);
    }
    // FETCH
    fetchBriefById(id: string) {
        return this.model.findById(id).select({
            basicInfo: 1,
            meta: 1,
            history: 1,
        });
    }
    //
    submitForReview(userId: string, courseId: string) {
        let data = {
            status: 'pending',
            history: {
                updatedBy: userId,
            },
        };
        data = this.attachHistoryData(data, 'update');
        const dotData = Helper.cvtDotObj(data);
        return this.model.updateOne(
            {
                status: 'draft',
                _id: courseId,
            },
            {
                $set: dotData,
            }
        );
    }

    handleCheckout(data: IMomoPaymentExtraData) {
        const courseIds = data.courses.map((item) => item._id);
        return this.model.updateMany(
            {
                _id: {
                    $in: courseIds,
                },
            },
            {
                $inc: {
                    'meta.studentCount': 1,
                },
            }
        );
    }
}
