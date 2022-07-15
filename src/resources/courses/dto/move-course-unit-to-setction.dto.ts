import { IsMongoId } from 'class-validator';
import { IsDefined, ValidateNested } from 'class-validator';
import { IsNumber } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger"
import { Type } from 'class-transformer';

class UnitAddress {
    @ApiProperty()
    @IsDefined()
    @IsMongoId()
    sectionId: string

    @ApiProperty()
    @IsDefined()
    @IsMongoId()
    id: string
}

export class MoveCourseUnitToSectionDto {
    @ApiProperty()
    @IsDefined()
    @IsMongoId()
    sectionId: string

    @ApiProperty()
    @ValidateNested()
    @Type(() => UnitAddress)
    unitAddress: UnitAddress

}