import { BadRequestException, Controller, Get, Query, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReviewsService } from '../../reviews/services/reviews.service';
import { ChartDataOptionsDto } from '../../users/dto/chart-data-options.dto';
import CourseFilterDto from '../../users/dto/course-filter.dto';
import { TotalDataOptionsDto } from '../../users/dto/total-data-options.dto';
import { TransactionsStatisticService } from './../../../features/statistic/services/transactions-statistic.service';

@Controller('performances/overview')
@ApiTags('performances/overview')
export class PerformanceOverviewController {
    constructor(
        private readonly transactionsStatisticService: TransactionsStatisticService,
        private readonly reviewsService: ReviewsService
    ) {}
    @Get('revenue-stats')
    async fetchRevenueStats(@Req() req, @Query() data: ChartDataOptionsDto) {
        return this.transactionsStatisticService.fetchRevenueStats(data);
    }
    @Get('enrollments-stats')
    async fetchEnrollmentsStats(@Req() req, @Query() data: ChartDataOptionsDto) {
        return this.transactionsStatisticService.fetchEnrollmentsStats(data);
    }
    @Get('total-revenue')
    async fetchTotalRevenue(@Req() req, @Query() data: TotalDataOptionsDto) {
        const value = await this.transactionsStatisticService.fetchTotalRevenue(data);
        if (typeof value != 'undefined') return value;
        throw new BadRequestException();
    }
    @Get('total-enrollments')
    async fetchTotalEnrollments(@Req() req, @Query() data: TotalDataOptionsDto) {
        const value = await this.transactionsStatisticService.fetchTotalEnrollments(data);
        if (typeof value != 'undefined') return value;
        throw new BadRequestException();
    }

    @Get('total-rating')
    async fetchTotalRating(@Req() req, @Query() data: TotalDataOptionsDto) {
        const value = await this.reviewsService.fetchTotalCourseRating(data);
        if (typeof value != 'undefined') return value;
        throw new BadRequestException();
    }
    @Get('course-rating-stats')
    async fetchCourseRatingStats(@Req() req, @Query() data: CourseFilterDto) {
        return this.reviewsService.fetchInstructorCourseRatingStats(data);
    }

    @Get('avg-course-rating')
    async fetchRating(@Req() req, @Query() data: TotalDataOptionsDto) {
        const value = await this.reviewsService.fetchAvgRatings(data);
        if (typeof value != 'undefined') return value;
        throw new BadRequestException();
    }
}
