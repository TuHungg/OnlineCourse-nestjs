import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsOptional, IsString } from 'class-validator';
export class CreateSliderDto {
    @ApiProperty()
    @IsString()
    @IsDefined()
    name: string;

    @ApiProperty()
    @IsString()
    @IsDefined()
    status: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    picture?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    description?: string;
}
