import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEmail, IsString } from 'class-validator';

export class SignUpDto {
    @ApiProperty()
    @IsString()
    @IsDefined()
    firstName: string;

    @ApiProperty()
    @IsString()
    @IsDefined()
    lastName: string;
    @ApiProperty()
    @IsEmail()
    @IsDefined()
    email: string;

    @ApiProperty()
    @IsString()
    @IsDefined()
    password: string;
}
