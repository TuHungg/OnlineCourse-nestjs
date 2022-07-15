import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ISelectItem } from 'src/common/shared/interfaces/select-item.interface'
import { RolesService } from './roles.service'

@ApiTags('document-permission')
@Controller('document-permission')
export class DocumentPermissionsController {
    constructor(private readonly rolesService: RolesService) {}

    @Get()
    fetchDocumentPermission() {
        return this.rolesService.fetchDocumentPermission()
    }

    @Get('select-data')
    async getSelectData(): Promise<ISelectItem[]> {
        return this.rolesService.getDocumentPermissionSelectData()
    }

    @Get('action/reset')
    resetDocumentPermission() {
        return this.rolesService.resetDocumentPermission()
    }
}
