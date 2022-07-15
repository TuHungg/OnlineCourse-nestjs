import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';
import { IsReviewContent, IsReviewRating } from './review.vld';
export class CreateReviewDto {
    @ApiProperty()
    @IsReviewRating({ required: true })
    rating: number;

    @ApiProperty()
    @IsReviewContent({ required: true })
    content: string;

    @ApiProperty()
    @IsMongoId()
    course: string;
}
