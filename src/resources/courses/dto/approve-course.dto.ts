import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEnum } from 'class-validator';

export type TApproveStatus = 'rejected' | 'active';
const statuses: TApproveStatus[] = ['rejected', 'active'];
export class ApproveCourseDto {
    @ApiProperty()
    @IsEnum(statuses)
    @IsDefined()
    status: TApproveStatus;
}
