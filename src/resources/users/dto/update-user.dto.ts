import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsDefined, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { IsUserPassword } from './user.vld';

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class ResetPasswordDto {
    @ApiProperty()
    @IsString()
    @IsDefined()
    token: string;

    @ApiProperty({ required: true })
    @IsUserPassword()
    password: string;
}
