import { NotificationsModule } from './../notifications/notifications.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from 'src/common/shared/shared.module';
import { FilesModule } from '../files/files.module';
import { QuizzesModule } from '../quizzes/quizzes.module';
import { UserCourseModule } from '../user-course/user-course.module';
import { CaslModule } from './../../casl/casl.module';
import { LecturesModule } from './../lectures/lectures.module';
import { CoursesClientController } from './controllers/clilent-courses.controller';
import { CoursesController } from './controllers/courses.controller';
import { CourseFormController } from './controllers/form-course.controller';
import { CourseAsyncModelFactory } from './schemas/course.schema';
import AcpCoursesService from './services/acp-courses.service';
import ClientCoursesService from './services/client-courses.service';
import { CoursesService } from './services/courses.service';
import FormCourseService from './services/form-course.service';
import InstructorCoursesService from './services/instructor-courses.service';

@Module({
    imports: [
        FilesModule,
        LecturesModule,
        QuizzesModule,
        MongooseModule.forFeatureAsync([CourseAsyncModelFactory]),
        SharedModule,
        CaslModule,
        UserCourseModule,
        NotificationsModule,
    ],
    controllers: [CourseFormController, CoursesClientController, CoursesController],
    providers: [
        CoursesService,
        FormCourseService,
        ClientCoursesService,
        InstructorCoursesService,
        AcpCoursesService,
    ],
    exports: [CoursesService, InstructorCoursesService, AcpCoursesService],
})
export class CoursesModule {}
