import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoursesModule } from '../courses/courses.module';
import { CaslModule } from './../../casl/casl.module';
import { SharedModule } from './../../common/shared/shared.module';
import { CourseReviewsController } from './controllers/course-review.controller';
import { ReviewsController } from './reviews.controller';
import { Review, ReviewSchema } from './schemas/review.schema';
import { CourseReviewsService } from './services/course-reviews.service';
import { ReviewsService } from './services/reviews.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Review.name,
                schema: ReviewSchema,
            },
        ]),
        SharedModule,
        CaslModule,
        CoursesModule,
    ],
    controllers: [ReviewsController, CourseReviewsController],
    providers: [ReviewsService, CourseReviewsService],
    exports: [ReviewsService, CourseReviewsService],
})
export class ReviewsModule {}
