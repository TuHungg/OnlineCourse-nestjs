import { ApiProperty } from '@nestjs/swagger';
import { IsUserEmail, IsUserPassword } from 'src/resources/users/dto/user.vld';
export class LoginDto {
    @ApiProperty()
    @IsUserEmail({ required: true })
    email: string;

    @ApiProperty()
    @IsUserPassword({ required: true })
    password: string;
}