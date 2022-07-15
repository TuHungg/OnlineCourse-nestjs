import { IsDefined, IsMongoId, ValidateNested } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger"
import { IsSlug } from "src/common/shared/validators/shared.vld"
import { IsTopicName } from "./topic.vld"
import { Type } from 'class-transformer';
import { HistoryProp } from 'src/common/shared/dtos/shared.dto';

export class CreateTopicDto {
    @ApiProperty()
    @IsTopicName({ required: true })
    name: string

    @ApiProperty()
    @IsSlug({ required: true })
    slug: string

    @ApiProperty({required:false})
    @IsMongoId({each:true})
    categories?: string[]

    @ApiProperty()
    @IsDefined()
    @ValidateNested()
    @Type(() => HistoryProp)
    history: HistoryProp
}
