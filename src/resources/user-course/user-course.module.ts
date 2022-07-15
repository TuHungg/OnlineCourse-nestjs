import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CaslModule } from './../../casl/casl.module';
import { Course, CourseSchema } from './../courses/schemas/course.schema';
import { UserCourse, UserCourseSchema } from './schemas/user_course.schema';
import { UserCourseController } from './user-course.controller';
import { UserCourseService } from './user-course.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: UserCourse.name,
                schema: UserCourseSchema,
            },
        ]),
        MongooseModule.forFeature([
            {
                name: Course.name,
                schema: CourseSchema,
            },
        ]),
        CaslModule,
    ],
    controllers: [UserCourseController],
    providers: [UserCourseService],
    exports: [UserCourseService],
})
export class UserCourseModule {}
