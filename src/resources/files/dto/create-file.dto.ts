import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsUrl, ValidateNested } from 'class-validator';
import { HistoryProp } from 'src/common/shared/dtos/shared.dto';
import { IsFileSize, IsFileName, IsFileType, IsFileStatus, IsFileDuration } from './file.vld';
export class CreateFileDto {
    @ApiProperty()
    @IsUrl({ required: true })
    url: string

    @ApiProperty()
    @IsFileName({ required: true })
    name: string

    @ApiProperty()
    @IsFileStatus({ required: true })
    status: string

    @ApiProperty()
    @IsFileSize({ required: true })
    size: number

    @ApiProperty()
    @IsFileType({ required: true })
    type: string

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUrl()
    thumbnailUrl?: string

    @ApiProperty({ required: false })
    @IsFileDuration()
    duration?: number

    @ApiProperty()
    @IsDefined()
    @ValidateNested()
    @Type(() => HistoryProp)
    history: HistoryProp
}