/* eslint-disable @typescript-eslint/no-inferrable-types */

import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsDateString, IsDefined } from "class-validator";

export class HistoryProp {
    @ApiProperty()
    @IsMongoId()
    createdBy: string;

    @ApiProperty({ required: false })
    createdAt?: string;

    @ApiProperty({ required: false })
    updatedBy?: string;

    @ApiProperty({ required: false })
    updatedAt?: string;
}

export class HistoryTimestampProp {
    @ApiProperty({ required: false })
    @IsDateString()
    createdAt?: string

    @ApiProperty({ required: false })
    @IsDateString()
    updatedAt?: string
}

export class ReactionProp {
    @ApiProperty({ required: false })
    @IsMongoId({ each: true })
    like: string[]

    @ApiProperty({ required: false })
    @IsMongoId({ each: true })
    dislike: string[]
}

export class IdParamDto {
    @IsDefined()
    @IsMongoId()
    id: string
}


