import { HistoryProp } from 'src/common/shared/dtos/shared.dto';
import { ApiProperty } from "@nestjs/swagger"
import { IsDefined, IsMongoId, IsOptional, IsString, ValidateNested } from "class-validator"
import { IsMyUrl } from 'src/resources/files/dto/file.vld';
import { IsSlug } from 'src/common/shared/validators/shared.vld';
import { IsCategoryName } from './category.vld';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
    @ApiProperty()
    @IsCategoryName({ required: true })
    name: string

    @ApiProperty()
    @IsSlug({ required: true })
    slug: string

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    status?: string

    @ApiProperty({ required: false })
    @IsOptional()
    @IsMongoId()
    parent?: string

    // @ApiProperty({ required: false })
    // @IsMyUrl()
    // image?: string

    @ApiProperty()
    @IsDefined()
    @ValidateNested()
    @Type(() => HistoryProp)
    history: HistoryProp
}
