import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ProfileDto } from './create-user.dto';
import { IsUserPassword } from './user.vld';

export class UpdateProfileDto {
    @ApiProperty({ required: false })
    @Type(() => ProfileDto)
    @ValidateNested()
    profile?: ProfileDto;

    // @ApiProperty({ required: false })
    // @Type(() => RestPasswordDto)
    // @ValidateNested()
    // reset?: RestPasswordDto;

    @ApiProperty({ required: false })
    @IsUserPassword()
    password?: string;
}
