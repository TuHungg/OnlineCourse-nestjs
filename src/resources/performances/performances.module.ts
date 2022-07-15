import { StatisticModule } from './../../features/statistic/statistic.module';
import { PerformanceOverviewController } from './controllers/performance-overview.controller';
import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { CaslModule } from 'src/casl/casl.module';
import { SharedModule } from 'src/common/shared/shared.module';
import { CategoriesModule } from '../categories/categories.module';
import { CommentsModule } from '../comments/comments.module';
import { CoursesModule } from '../courses/courses.module';
import { FilesModule } from '../files/files.module';
import { LecturesModule } from '../lectures/lectures.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrdersModule } from '../orders/orders.module';
import { QuizzesModule } from '../quizzes/quizzes.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { RolesModule } from '../roles/roles.module';
import { TopicsModule } from '../topics/topics.module';
import { UserCourseModule } from '../user-course/user-course.module';
import { UsersModule } from '../users/users.module';
import { PerformancesController } from './controllers/performances.controller';

@Module({
    controllers: [PerformancesController, PerformanceOverviewController],
    imports: [
        SharedModule,
        CoursesModule,
        UsersModule,
        FilesModule,
        CommentsModule,
        CategoriesModule,
        TopicsModule,
        NotificationsModule,
        RolesModule,
        ReviewsModule,
        LecturesModule,
        QuizzesModule,
        AuthModule,
        OrdersModule,
        UserCourseModule,
        CaslModule,
        StatisticModule,
    ],
})
export class PerformancesModule {}
