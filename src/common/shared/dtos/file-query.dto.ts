import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export type TFileType = 'all' | 'video';
export class FileQueryDto {
    @ApiProperty({
        required: false,
        name: '_searchValue',
    })
    search: string;

    @ApiProperty({
        required: false,
        name: '_searchValue',
    })
    fileType: TFileType;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    _limit = 100;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    _page = 1;
}
