import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    Request,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import lodash from 'lodash';
import { BaseController } from 'src/common/shared/base-controller';
import { ClientQueryDto } from 'src/common/shared/dtos/client-query.dto';
import { ACCESS_TOKEN_KEY } from 'src/common/utils/constants/app.constant';
import ControllerHelper from 'src/common/utils/helpers/ControllerHelper';
import { JwtAuthGuard } from './../../auth/guards/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review, ReviewDocument } from './schemas/review.schema';
import { CourseReviewsService } from './services/course-reviews.service';
import { ReviewsService } from './services/reviews.service';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController extends BaseController<Review, ReviewDocument> {
    constructor(
        private readonly reviewsService: ReviewsService,
        private readonly courseReviewsService: CourseReviewsService
    ) {
        super(reviewsService);
    }

    @Get('user-review/:id')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard)
    async fetchUserRating(@Req() req, @Param('id') courseId: string) {
        const item = await this.reviewsService.getUserRating(req.user._id, courseId);
        if (!item) return null;
        return item;
    }

    // FETCHES
    @Get()
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard)
    protected async fetchAll(@Query() query: ClientQueryDto): Promise<Review[]> {
        return super.findAll(query);
    }
    //
    @Get('count')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard)
    @UsePipes(new ValidationPipe({ transform: true }))
    async count(@Query() query: ClientQueryDto): Promise<number> {
        return super.count(query);
    }
    //
    @Get(':id')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard)
    async fetchById(@Param('id') id: string): Promise<Review> {
        return super.findById(id);
    }
    // CREATE
    @Post()
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard)
    create(@Request() req, @Body() data: CreateReviewDto) {
        lodash.set(data, 'user', req.user._id);
        return this.courseReviewsService.addUserReview(req.user._id, data);
    }
    // UPDATE
    @Patch('user-review/:id')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard)
    async updateUserReview(
        @Request() req,
        @Param('id') courseId: string,
        @Body() data: UpdateReviewDto
    ) {
        const result = await this.courseReviewsService.updateUserReview(req.user, courseId, data);
        return ControllerHelper.handleUpdateResult(result);
    }
    @Patch(':id')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard)
    update(@Param('id') id: string, @Body() data: UpdateReviewDto) {
        return this.reviewsService.updateById(id, data);
    }
    // DELETE
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    async deleteRecord(@Param('id') id: string): Promise<Review> {
        return this.courseReviewsService.deleteUserReview(id);
    }
}
