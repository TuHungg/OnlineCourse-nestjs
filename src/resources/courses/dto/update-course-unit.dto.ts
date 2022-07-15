import { ApiProperty } from "@nestjs/swagger";
import { Type } from 'class-transformer';
import { IsDefined, IsMongoId, IsNumber, ValidateNested } from 'class-validator';
import { Unit } from './create-course.dto';

export class UpdateCourseUnitDto {
    @ApiProperty()
    @IsDefined()
    @IsNumber()
    sectionIndex: number

    @ApiProperty()
    @IsDefined()
    @IsMongoId()
    unitId: string

    @ApiProperty()
    @IsDefined()
    @ValidateNested()
    @Type(() => Unit)
    data: Unit
}