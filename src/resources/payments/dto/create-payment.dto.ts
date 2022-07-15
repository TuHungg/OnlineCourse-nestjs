import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsMongoId } from 'class-validator';

export class CreatePaymentDto {
    @ApiProperty()
    @IsDefined()
    @IsMongoId()
    user: string;
}
