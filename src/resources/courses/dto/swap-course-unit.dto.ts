import { IsDefined, IsMongoId } from 'class-validator';
import { IsNumber } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger"

export class SwapCourseUnitDto {
    @ApiProperty()
    @IsDefined()
    @IsMongoId()
    parentAId: string

    @ApiProperty()
    @IsDefined()
    @IsMongoId()
    aId: string

    @ApiProperty()
    @IsDefined()
    @IsMongoId()
    parentBId: string

    @ApiProperty()
    @IsDefined()
    @IsMongoId()
    bId: string
}