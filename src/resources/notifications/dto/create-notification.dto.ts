import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsDefined, IsMongoId } from 'class-validator';
import { IsNotificationMessage, IsNotificationType } from './notification.vld';
export class CreateNotificationDto {
    @ApiProperty()
    @IsDefined()
    @IsMongoId()
    receiver: string

    @ApiProperty()
    @IsDefined()
    @IsMongoId()
    sender: string

    @ApiProperty()
    @IsNotificationType({ required: true })
    type: string

    @ApiProperty()
    @IsNotificationMessage({ required: true })
    message: string

    @ApiProperty({required:false})
    @IsBoolean()
    isRead?: boolean

    @ApiProperty({required:false})
    @IsDateString()
    createdAt?: string
}
