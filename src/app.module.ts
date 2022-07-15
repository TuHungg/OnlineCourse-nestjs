import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from '../config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CaslModule } from './casl/casl.module';
import { SharedModule } from './common/shared/shared.module';
import { StatisticModule } from './features/statistic/statistic.module';
import { MailModule } from './mail/mail.module';
import { CategoriesModule } from './resources/categories/categories.module';
import { CommentsModule } from './resources/comments/comments.module';
import { ConfigurationModule } from './resources/configuration/configuration.module';
import { CoursesModule } from './resources/courses/courses.module';
import { FilesModule } from './resources/files/files.module';
import { LecturesModule } from './resources/lectures/lectures.module';
import { NotificationsModule } from './resources/notifications/notifications.module';
import { OrdersModule } from './resources/orders/orders.module';
import { PaymentsModule } from './resources/payments/payments.module';
import { PerformancesModule } from './resources/performances/performances.module';
import { QuizzesModule } from './resources/quizzes/quizzes.module';
import { ReviewsModule } from './resources/reviews/reviews.module';
import { RolesModule } from './resources/roles/roles.module';
import { SlidersModule } from './resources/sliders/sliders.module';
import { TopicsModule } from './resources/topics/topics.module';
import { TransactionsModule } from './resources/transactions/transactions.module';
import { UserCourseModule } from './resources/user-course/user-course.module';
import { UsersModule } from './resources/users/users.module';
import { UtilsModule } from './resources/utils/utils.module';
import { ActivityLogsModule } from './resources/activity-logs/activity-logs.module';

@Module({
    imports: [
        SharedModule,
        ConfigModule.forRoot({
            envFilePath: `${process.cwd()}/config/env/${process.env.NODE_ENV}.env`,
            load: [configuration],
        }),
        MongooseModule.forRoot(
            `mongodb+srv://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@onlinecourse.5d9dy.mongodb.net/${process.env.DATABASE_NAME}?retryWrites=true&w=majority`
        ),
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
        PerformancesModule,
        ConfigurationModule,
        PaymentsModule,
        TransactionsModule,
        StatisticModule,
        MailModule,
        SlidersModule,
        UtilsModule,
        ActivityLogsModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
