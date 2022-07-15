import { ApiProperty } from "@nestjs/swagger";
import { Type } from 'class-transformer';
import { IsDefined, IsMongoId, ValidateNested } from 'class-validator';
import { Section } from './create-course.dto';

export class UpdateCourseSectionDto {
    @ApiProperty()
    @IsDefined()
    @IsMongoId()
    sectionId: string

    @ApiProperty()
    @IsDefined()
    @ValidateNested()
    @Type(() => Section)
    data: Section
}