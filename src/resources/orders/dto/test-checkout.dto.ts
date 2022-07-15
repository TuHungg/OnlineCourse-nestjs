import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsDefined, IsMongoId } from 'class-validator';
export default class TestCheckoutDto {
    @ApiProperty({
        default: (() => {
            const d = new Date();
            d.setHours(0);
            d.setMinutes(0);
            d.setSeconds(0);
            d.setMilliseconds(0);
            return d.toISOString();
        })(),
    })
    @IsDefined()
    @IsDateString()
    date: string;

    @ApiProperty({})
    @IsDefined()
    @IsMongoId()
    userId: string;

    @ApiProperty()
    @IsDefined()
    @IsMongoId({ each: true })
    courseIds: string[];
}
