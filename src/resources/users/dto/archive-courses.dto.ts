import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsMongoId } from 'class-validator';

export class ArchiveCoursesDto {
    @ApiProperty()
    @IsDefined()
    @IsMongoId({ each: true })
    userCourseIds: string[];
}
