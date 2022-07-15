import { Body, ConflictException, Controller, Get, Param, Patch, Query } from '@nestjs/common'
import { ApiQuery, ApiTags } from '@nestjs/swagger'
import ControllerHelper from 'src/common/utils/helpers/ControllerHelper'
import { AddPermissionDto } from './dto/add-permission.dto'
import { UpdatePermissionDto } from './dto/update-permission.dto'
import { RolesService } from './roles.service'

@ApiTags('roles/permission')
@Controller('roles/permission')
export class RolePermissionsController {
    constructor(private readonly rolesService: RolesService) {}

    @Get(':roleId')
    @ApiQuery({
        type: String,
        name: 'documentPermissionId',
        required: false,
    })
    async fetchRolePermissions(
        @Param('roleId') roleId: string,
        @Query('documentPermissionId') documentPermissionId?: string
    ) {
        return this.rolesService.fetchRolePermissions(roleId, documentPermissionId)
    }

    @Patch('add-permission/:roleId')
    async addPermission(@Param('roleId') roleId: string, @Body() data: AddPermissionDto) {
        const checkPermissionExist = await this.rolesService.checkPermissionExist(
            roleId,
            data.documentPermission
        )
        if (!checkPermissionExist) {
            const result = await this.rolesService.addPermission(roleId, data)
            return ControllerHelper.handleUpdateResult(result)
        }
        throw new ConflictException()
    }

    @Patch('update-permission/:roleId/:documentPermissionId')
    async updatePermission(
        @Param('roleId') roleId: string,
        @Param('documentPermissionId') documentPermissionId: string,
        @Body() data: UpdatePermissionDto
    ) {
        const result = await this.rolesService.updatePermission(roleId, documentPermissionId, data)
        return ControllerHelper.handleUpdateResult(result)
    }

    @Patch('delete-permission/:roleId/:documentPermissionId')
    async deletePermission(
        @Param('roleId') roleId: string,
        @Param('documentPermissionId') documentPermissionId: string
    ) {
        const result = await this.rolesService.deletePermission(roleId, documentPermissionId)
        return ControllerHelper.handleUpdateResult(result)
    }
}
