import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, Max, Min } from 'class-validator';
import CourseFilterDto from './course-filter.dto';

export type TTimeUnit = 'd' | 'M' | 'all';

export const TimeUnits: TTimeUnit[] = ['d', 'M', 'all'];

export class ChartDataOptionsDto extends CourseFilterDto {
    @ApiProperty({
        required: true,
        name: 'value',
        default: 7,
        minimum: 7,
        maximum: 30,
        exclusiveMaximum: false,
        exclusiveMinimum: false,
    })
    @IsInt()
    @Max(30)
    @Min(7)
    @Type(() => Number)
    value: number;

    @ApiProperty({
        required: true,
        name: 'timeUnit',
        default: 'd',
    })
    @IsEnum(TimeUnits)
    timeUnit: TTimeUnit;
}
