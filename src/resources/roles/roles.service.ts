import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import dummy_document_permissions from 'src/common/dummy_data/dummy_document_permissions';
import dummy_roles from 'src/common/dummy_data/dummy_roles';
import { BaseModel } from 'src/common/shared/base-model';
import IConflictData from 'src/common/shared/interfaces/conflict-data.interface';
import Helper from 'src/common/utils/helpers/helper.helper';
import { ISelectItem } from './../../common/shared/interfaces/select-item.interface';
import { AddPermissionDto } from './dto/add-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import {
    DocumentPermission,
    DocumentPermissionDocument,
} from './schemas/document-permission.schema';
import { Permission, Role, RoleDocument } from './schemas/role.schema';

@Injectable()
export class RolesService extends BaseModel<Role, RoleDocument> {
    protected selectLabelField = 'name';

    protected searchFields: string[] = ['name'];
    protected displayFields: string[] = [
        '_id',
        'status',
        'name',
        'ordering',
        'description',
        'permissions',
        'createdAt',
        'updatedAt',
    ];
    get dummyData(): any[] {
        return dummy_roles;
    }
    constructor(
        @InjectModel(Role.name) protected roleModel: Model<RoleDocument>,
        @InjectModel(DocumentPermission.name)
        protected documentPermissionModel: Model<DocumentPermissionDocument>
    ) {
        super('roles', roleModel);
    }

    async getSelectData() {
        return this.model
            .find<ISelectItem>({}, super.getSelectDataProject())
            .sort({
                ordering: 1,
                name: 1,
            })
            .exec();
    }

    async fetchDocumentPermission() {
        return this.documentPermissionModel.find();
    }
    async getDocumentPermissionSelectData(): Promise<ISelectItem[]> {
        const items = await this.documentPermissionModel
            .find<ISelectItem>({}, super.getSelectDataProject())
            .sort({
                ordering: 1,
                name: 1,
            })
            .exec();
        return items;
    }

    async resetDocumentPermission(): Promise<DocumentPermission[]> {
        await this.documentPermissionModel.deleteMany();
        await this.documentPermissionModel.insertMany(dummy_document_permissions);
        return this.documentPermissionModel.find();
    }
    //
    async fetchRolePermissions(
        roleId: string,
        documentPermissionId?: string
    ): Promise<Permission[] | undefined> {
        let query;
        if (!!documentPermissionId) {
            query = this.roleModel.findOne(
                {
                    _id: roleId,
                    'permissions.documentPermission': documentPermissionId,
                },
                {
                    'permissions.$': 1,
                }
            );
        } else {
            query = this.roleModel.findOne({ _id: roleId });
        }
        const item = await query
            .populate([
                {
                    path: 'permissions.documentPermission',
                },
            ])
            .exec();
        if (item) {
            return item.permissions.sort((a: Permission, b: Permission) => {
                return a.documentPermission.ordering - b.documentPermission.ordering;
            });
        } else {
            return [];
        }
    }
    async checkPermissionExist(roleId: string, documentPermissionId: string) {
        const item = await this.roleModel.findOne({
            _id: roleId,
            'permissions.documentPermission': documentPermissionId,
        });
        return !!item;
    }
    addPermission(roleId: string, data: AddPermissionDto) {
        return this.roleModel.updateOne(
            { _id: roleId },
            {
                $addToSet: {
                    permissions: {
                        documentPermission: data.documentPermission,
                    },
                },
            }
        );
    }
    updatePermission(roleId: string, documentPermissionId: string, data: UpdatePermissionDto) {
        const updateData = Helper.cvtDotObj({
            permissions: {
                $: data,
            },
        });
        return this.roleModel.updateOne(
            { _id: roleId, 'permissions.documentPermission': documentPermissionId },
            updateData
        );
    }
    deletePermission(roleId: string, documentPermissionId: string) {
        return this.roleModel.updateOne(
            { _id: roleId },
            {
                $pull: {
                    permissions: {
                        documentPermission: documentPermissionId,
                    },
                },
            }
        );
    }
}
