import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClientQueryDto } from 'src/common/shared/dtos/client-query.dto';
import { CourseReviewsService } from './../services/course-reviews.service';

@ApiTags('course reviews')
@Controller('courses/:id/reviews')
export class CourseReviewsController {
    constructor(private readonly courseReviewsService: CourseReviewsService) {}

    @Get()
    fetchReviews(@Param('id') id: string, @Query() query: ClientQueryDto) {
        return this.courseReviewsService.fetchCourseReviews(id, query);
    }
    @Get('count')
    countReviews(@Param('id') id: string, @Query() query: ClientQueryDto) {
        return this.courseReviewsService.countCourseReviews(id, query);
    }
}
