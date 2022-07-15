import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsDefined, IsOptional, IsString } from 'class-validator'
import { IsOrdering } from 'src/common/shared/validators/shared.vld'
import { IsRoleName } from './role.vld'

export class CreateRoleDto {
    @ApiProperty()
    @IsRoleName({ required: true })
    name: string

    @ApiProperty()
    @IsOrdering({ required: true })
    ordering: number

    @ApiProperty()
    @IsDefined()
    @IsString()
    status: string

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString({ each: true })
    permissions?: string[]

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    createdAt?: string

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    updatedAt?: string
}
