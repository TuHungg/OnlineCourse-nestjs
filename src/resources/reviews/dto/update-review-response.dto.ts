import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString } from 'class-validator';

export class UpdateReviewResponseDto {
    @ApiProperty()
    @IsString()
    @IsDefined()
    content: string;
}
