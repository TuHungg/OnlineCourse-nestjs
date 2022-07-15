import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';
import { ClientQueryDto } from 'src/common/shared/dtos/client-query.dto';
import ControllerHelper from 'src/common/utils/helpers/ControllerHelper';
import { TransactionsStatisticService } from 'src/features/statistic/services/transactions-statistic.service';
import { User } from 'src/resources/users/schemas/user.schema';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { ACCESS_TOKEN_KEY } from '../../../common/utils/constants/app.constant';
import { VIEW_INSTRUCTOR_ID } from '../../../common/utils/constants/url-key.constant';
import InstructorCoursesService from '../../courses/services/instructor-courses.service';
import { InstructorPaymentsService } from '../../payments/services/instructor-payments.service';
import { UpdateReviewResponseDto } from '../../reviews/dto/update-review-response.dto';
import { TransactionsService } from '../../transactions/transactions.service';
import { UserCourseService } from '../../user-course/user-course.service';
import { ChartDataOptionsDto } from '../dto/chart-data-options.dto';
import CourseFilterDto from '../dto/course-filter.dto';
import { TotalDataOptionsDto } from '../dto/total-data-options.dto';
import { CourseReviewsService } from './../../reviews/services/course-reviews.service';

@ApiTags('users/instructor')
@Controller('users/instructor')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth(ACCESS_TOKEN_KEY)
export class UserInstructorController {
    constructor(
        private readonly transactionsStatisticService: TransactionsStatisticService,
        private readonly userCourseService: UserCourseService,
        private readonly instructorCoursesService: InstructorCoursesService,
        private readonly instructorPaymentsService: InstructorPaymentsService,
        private readonly courseReviewsService: CourseReviewsService,
        private readonly transactionsService: TransactionsService,
        private caslAbilityFactory: CaslAbilityFactory
    ) {}

    @Get('count-students')
    countStudents(@Req() req, @Query() query: ClientQueryDto) {
        return this.userCourseService.countStudents(
            this.getInstructorId(req.user, query[VIEW_INSTRUCTOR_ID]),
            query
        );
    }
    @Get('students')
    getStudents(@Req() req, @Query() query: ClientQueryDto) {
        return this.userCourseService.fetchStudents(
            this.getInstructorId(req.user, query[VIEW_INSTRUCTOR_ID]),
            query
        );
    }

    @Get('payment-transactions/:paymentId')
    fetchPaymentTransactions(
        @Param('paymentId') paymentId: string,
        @Query() query: ClientQueryDto
    ) {
        return this.transactionsService.getPaymentTransactions(paymentId, query);
    }
    @Get('count-payment-transactions/:paymentId')
    countPaymentTransactions(
        @Param('paymentId') paymentId: string,
        @Query() query: ClientQueryDto
    ) {
        return this.transactionsService.countPaymentTransactions(paymentId, query);
    }
    @Get('payment/:paymentId')
    fetchPayment(@Req() req, @Param('paymentId') paymentId: string) {
        return this.instructorPaymentsService.getPaymentDetail(paymentId);
    }

    @Get('pending-payments')
    fetchPendingPayments(@Req() req, @Query() query: ClientQueryDto) {
        return this.instructorPaymentsService.getPendingPayments(
            this.getInstructorId(req.user, query[VIEW_INSTRUCTOR_ID])
        );
    }
    @Get('count-payments')
    countPayments(@Req() req, @Query() query: ClientQueryDto) {
        return this.instructorPaymentsService.countPayments(
            this.getInstructorId(req.user, query[VIEW_INSTRUCTOR_ID]),
            query
        );
    }
    @Get('payments')
    fetchPayments(@Req() req, @Query() query: ClientQueryDto) {
        return this.instructorPaymentsService.fetchPayments(
            this.getInstructorId(req.user, query[VIEW_INSTRUCTOR_ID]),
            query
        );
    }
    @Get('count-courses')
    countCourses(@Req() req, @Query() query: ClientQueryDto) {
        return this.instructorCoursesService.countCourses(
            this.getInstructorId(req.user, query[VIEW_INSTRUCTOR_ID]),
            query
        );
    }
    @Get('courses')
    fetchCourses(@Req() req, @Query() query: ClientQueryDto) {
        return this.instructorCoursesService.fetchCourses(
            this.getInstructorId(req.user, query[VIEW_INSTRUCTOR_ID]),
            query
        );
    }
    @Get('count-reviews')
    countReviews(@Req() req, @Query() query: ClientQueryDto) {
        return this.courseReviewsService.countInstructorCourseReviews(
            this.getInstructorId(req.user, query[VIEW_INSTRUCTOR_ID]),
            query
        );
    }
    @Get('reviews')
    getReviews(@Req() req, @Query() query: ClientQueryDto) {
        return this.courseReviewsService.fetchInstructorCourseReviews(
            this.getInstructorId(req.user, query[VIEW_INSTRUCTOR_ID]),
            query
        );
    }

    @Patch('update-review-response/:id')
    async updateReviewRespond(
        @Req() req,
        @Param('id') reviewId,
        @Body() data: UpdateReviewResponseDto
    ) {
        const result = await this.courseReviewsService.updateReviewRespond(
            req.user._id,
            reviewId,
            data
        );
        return ControllerHelper.handleUpdateResult(result);
    }

    @Patch('delete-review-response/:id')
    async deleteReviewRespond(@Req() req, @Param('id') reviewId) {
        const result = await this.courseReviewsService.deleteReviewRespond(req.user._id, reviewId);
        return ControllerHelper.handleUpdateResult(result);
    }

    @Get('revenue-stats')
    async fetchRevenueStats(@Req() req, @Query() data: ChartDataOptionsDto) {
        return this.transactionsStatisticService.fetchRevenueStats(
            data,
            this.getInstructorId(req.user, data[VIEW_INSTRUCTOR_ID])
        );
    }
    @Get('enrollments-stats')
    async fetchEnrollmentsStats(@Req() req, @Query() data: ChartDataOptionsDto) {
        return this.transactionsStatisticService.fetchEnrollmentsStats(
            data,
            this.getInstructorId(req.user, data[VIEW_INSTRUCTOR_ID])
        );
    }
    @Get('total-revenue')
    async fetchTotalRevenue(@Req() req, @Query() data: TotalDataOptionsDto) {
        const value = await this.transactionsStatisticService.fetchTotalRevenue(
            data,
            this.getInstructorId(req.user, data[VIEW_INSTRUCTOR_ID])
        );
        if (typeof value != 'undefined') return value;
        throw new BadRequestException();
    }
    @Get('total-enrollments')
    async fetchTotalEnrollments(@Req() req, @Query() data: TotalDataOptionsDto) {
        const value = await this.transactionsStatisticService.fetchTotalEnrollments(
            data,
            this.getInstructorId(req.user, data[VIEW_INSTRUCTOR_ID])
        );
        if (typeof value != 'undefined') return value;
        throw new BadRequestException();
    }

    @Get('total-rating')
    async fetchTotalRating(@Req() req, @Query() data: TotalDataOptionsDto) {
        const value = await this.courseReviewsService.fetchTotalCourseRating(
            data,

            this.getInstructorId(req.user, data[VIEW_INSTRUCTOR_ID])
        );
        if (typeof value != 'undefined') return value;
        throw new BadRequestException();
    }
    @Get('course-rating-stats')
    async fetchCourseRatingStats(@Req() req, @Query() data: CourseFilterDto) {
        return this.courseReviewsService.fetchInstructorCourseRatingStats(
            data,
            this.getInstructorId(req.user, data[VIEW_INSTRUCTOR_ID])
        );
    }

    @Get('avg-course-rating')
    async fetchRating(@Req() req, @Query() data: TotalDataOptionsDto) {
        const value = await this.courseReviewsService.fetchAvgRatings(
            data,
            this.getInstructorId(req.user, data[VIEW_INSTRUCTOR_ID])
        );
        if (typeof value != 'undefined') return value;
        throw new BadRequestException();
    }

    private getInstructorId(user: User, viewInstructorId): string {
        const instructorId =
            viewInstructorId &&
            this.caslAbilityFactory.createForUser(user).can('view', 'Performances')
                ? viewInstructorId
                : user._id;
        return instructorId;
    }
}
