import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString } from 'class-validator'
import { TPermission } from 'src/common/utils/constants/role.constant'

export class UpdatePermissionDto {
    @ApiProperty()
    @IsOptional()
    @IsString({ each: true })
    enabledPermissions?: TPermission[]

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    onlyForCreator?: boolean
}
