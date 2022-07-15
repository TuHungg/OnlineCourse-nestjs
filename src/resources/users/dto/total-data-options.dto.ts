import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsOptional } from 'class-validator';

export type TRange = 'M' | 'all';

export const ranges: TRange[] = ['M', 'all'];

export class TotalDataOptionsDto {
    @ApiProperty({
        required: false,
        name: 'course._id_filter',
    })
    @IsOptional()
    @IsMongoId()
    ['course._id_filter']: string;

    @ApiProperty({
        required: true,
        name: 'range',
        default: 'all',
    })
    @IsEnum(ranges)
    range: TRange;
}
