import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsMongoId } from 'class-validator';

export class CreateTransactionDto {
    @ApiProperty()
    @IsDefined()
    @IsMongoId()
    paymentId: string;
}
