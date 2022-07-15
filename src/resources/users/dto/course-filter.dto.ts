import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsMongoId } from 'class-validator';

export default class CourseFilterDto {
    @ApiProperty({
        required: false,
        name: 'course._id_filter',
    })
    @IsOptional()
    @IsMongoId()
    ['course._id_filter']: string;
}
