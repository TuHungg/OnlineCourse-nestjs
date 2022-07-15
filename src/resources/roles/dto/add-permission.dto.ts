import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsMongoId } from 'class-validator'

export class AddPermissionDto {
    @ApiProperty()
    @IsMongoId()
    @IsDefined()
    documentPermission: string
}
