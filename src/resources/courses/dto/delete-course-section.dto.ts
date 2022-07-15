import { IsMongoId } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsNumber } from 'class-validator';

export class DeleteCourseSectionDto {
    @ApiProperty()
    @IsDefined()
    @IsMongoId()
    sectionId: string
}