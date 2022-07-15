import { IsDefined } from 'class-validator'
import { IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { IsUserEmail, IsUserPassword } from 'src/resources/users/dto/user.vld'
export class VerifyRecaptchaDto {
    @ApiProperty()
    @IsDefined()
    @IsString()
    secret: string

    @ApiProperty()
    @IsDefined()
    @IsString()
    response: string
}
