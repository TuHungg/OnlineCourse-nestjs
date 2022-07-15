import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsMongoId } from 'class-validator';

export class FavCoursesDto {
    @ApiProperty()
    @IsDefined()
    @IsMongoId({ each: true })
    courseIds: string[];
}
