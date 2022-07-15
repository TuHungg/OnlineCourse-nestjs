import { IsDefined, IsMongoId } from 'class-validator';
import { IsNumber } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger"

export class SwapCourseSectionDto {
    @ApiProperty()
    @IsDefined()
    @IsMongoId()
    aId: string

    @ApiProperty()
    @IsDefined()
    @IsMongoId()
    bId: string

}