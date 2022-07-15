import { DocumentPermissionsController } from './document-permission.controller'
import { RolePermissionsController } from './role-permission.controller'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CaslModule } from './../../casl/casl.module'
import { SharedModule } from './../../common/shared/shared.module'
import { RolesController } from './roles.controller'
import { RolesService } from './roles.service'
import { DocumentPermission, DocumentPermissionSchema } from './schemas/document-permission.schema'
import { Role, RoleSchema } from './schemas/role.schema'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Role.name,
                schema: RoleSchema,
            },
            {
                name: DocumentPermission.name,
                schema: DocumentPermissionSchema,
            },
        ]),
        SharedModule,
        CaslModule,
    ],
    controllers: [DocumentPermissionsController, RolePermissionsController, RolesController],
    providers: [RolesService],
    exports: [RolesService],
})
export class RolesModule {}
