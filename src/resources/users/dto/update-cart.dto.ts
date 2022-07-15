import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsMongoId } from 'class-validator';

export class UpdateCartDto {
    @ApiProperty({ required: false })
    @IsMongoId({ each: true })
    @IsDefined()
    courses: string[];
}
