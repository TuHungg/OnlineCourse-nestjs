import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString } from 'class-validator';

export class VerifyEmailDto {
    @ApiProperty()
    @IsString()
    @IsDefined()
    code: string;
}
