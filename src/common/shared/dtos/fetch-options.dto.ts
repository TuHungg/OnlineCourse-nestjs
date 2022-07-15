import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class FetchOptionsDto {
    @ApiProperty({
        required: false,
        name: '_limit',
    })
    @Type(() => Number)
    @IsInt()
    _limit = 5;

    @ApiProperty({
        required: false,
        name: '_page',
    })
    @Type(() => Number)
    @IsInt()
    _page = 1;
}
