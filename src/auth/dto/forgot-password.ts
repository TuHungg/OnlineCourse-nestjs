import { ApiProperty } from '@nestjs/swagger';
import { IsUserEmail } from 'src/resources/users/dto/user.vld';
export class ForgotPasswordDto {
    @ApiProperty()
    @IsUserEmail({ required: true })
    email: string;
}
