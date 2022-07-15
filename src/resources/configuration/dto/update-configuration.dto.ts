import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, ValidateNested } from 'class-validator';

class CourseConfigurationDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber({}, { each: true })
    priceTiers?: number[];
}

class MoneyConfigurationDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    instructorCommission?: number;
}
export class UpdateConfigurationDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => CourseConfigurationDto)
    course?: CourseConfigurationDto;

    @ApiProperty({ required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => MoneyConfigurationDto)
    money?: MoneyConfigurationDto;
}
