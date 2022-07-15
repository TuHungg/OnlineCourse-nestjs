import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class ClientQueryDto {
    @ApiProperty({
        required: false,
        name: '_page',
        default: 1,
        minimum: 1,
        maximum: 1000,
        exclusiveMaximum: false,
        exclusiveMinimum: false,
    })
    @Type(() => Number)
    @IsInt()
    @Max(1000)
    @Min(1)
    _page = 1;

    @ApiProperty({
        required: false,
        name: '_sortBy',
        isArray: true,
    })
    _sortBy: string[] = [];

    @ApiProperty({
        required: false,
        name: '_order',
        isArray: true,
    })
    _order: string[] = [];

    @ApiProperty({
        required: false,
        name: '_limit',
        default: 100,
        minimum: 1,
        maximum: 1000,
        exclusiveMaximum: false,
        exclusiveMinimum: false,
    })
    @Type(() => Number)
    @IsInt()
    @Max(1000)
    @Min(1)
    _limit = 100;

    @ApiProperty({
        required: false,
        type: 'object',
        name: '_filter',
        additionalProperties: true,
    })
    filter: Record<string, any>;
    @ApiProperty({
        required: false,
        name: '_context',
    })
    _context: string;
    @ApiProperty({
        required: false,
        name: '_searchField',
    })
    _searchField: string;
    @ApiProperty({
        required: false,
        name: '_searchValue',
    })
    _searchValue: string;
    [key: string]: any;
}
