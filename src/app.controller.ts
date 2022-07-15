import { Controller, Get, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
    AVATAR_DIR,
    COURSE_IMAGE_DIR,
    LECTURE_RESOURCE_DIR,
    SLIDER_DIR,
    VIDEO_THUMBNAIL_DIR,
} from './common/utils/constants/firebase.constant';
import { bucket } from './common/utils/firebase/firebase';
import { CategoriesService } from './resources/categories/categories.service';
import { CommentsService } from './resources/comments/comments.service';
import { ConfigurationService } from './resources/configuration/configuration.service';
import { CoursesService } from './resources/courses/services/courses.service';
import { FilesService } from './resources/files/files.service';
import { LecturesService } from './resources/lectures/lectures.service';
import { NotificationsService } from './resources/notifications/services/notifications.service';
import { OrdersService } from './resources/orders/services/orders.service';
import { PaymentsService } from './resources/payments/services/payments.service';
import { QuizzesService } from './resources/quizzes/quizzes.service';
import { ReviewsService } from './resources/reviews/services/reviews.service';
import { RolesService } from './resources/roles/roles.service';
import { SlidersService } from './resources/sliders/sliders.service';
import { TopicsService } from './resources/topics/topics.service';
import { TransactionsService } from './resources/transactions/transactions.service';
import { UserCourseService } from './resources/user-course/user-course.service';
import { UsersService } from './resources/users/users.service';

@ApiTags('app')
@Controller()
export class AppController {
    constructor(
        private readonly slidersService: SlidersService,
        private readonly rolesService: RolesService,
        private readonly usersService: UsersService,
        private readonly courseService: CoursesService,
        private readonly categoriesService: CategoriesService,
        private readonly topicsService: TopicsService,
        private readonly filesService: FilesService,
        private readonly reviewsService: ReviewsService,
        private readonly commentsService: CommentsService,
        private readonly lecturesService: LecturesService,
        private readonly quizzesService: QuizzesService,
        private readonly notificationsService: NotificationsService,
        private readonly ordersService: OrdersService,
        private readonly userCourseService: UserCourseService,
        private readonly configurationService: ConfigurationService,
        private readonly transactionsService: TransactionsService,
        private readonly paymentsService: PaymentsService
    ) {}

    @Get()
    async hello() {
        return 'This is api for Online Course';
    }

    @Get('action/migrate')
    async reset() {
        await this.slidersService.reset();
        await this.configurationService.reset();
        await this.rolesService.reset();
        await this.usersService.reset();
        await this.categoriesService.reset();
        await this.topicsService.reset();
        await this.filesService.reset();
        await this.lecturesService.reset();
        await this.quizzesService.reset();
        await this.courseService.reset();
        await this.reviewsService.reset();
        await this.commentsService.reset();
        await this.notificationsService.reset();
        await this.ordersService.reset();
        await this.userCourseService.reset();
        await this.transactionsService.reset();
        await this.paymentsService.reset();
        await bucket.deleteFiles({ prefix: VIDEO_THUMBNAIL_DIR });
        await bucket.deleteFiles({ prefix: COURSE_IMAGE_DIR });
        await bucket.deleteFiles({ prefix: LECTURE_RESOURCE_DIR });
        await bucket.deleteFiles({ prefix: AVATAR_DIR });
        await bucket.deleteFiles({ prefix: SLIDER_DIR });
    }

    @Get('client-ip')
    async getClientIp(@Req() req) {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
        return { ip };
    }
}
