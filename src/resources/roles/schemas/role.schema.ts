import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { TPermission } from 'src/common/utils/constants/role.constant';
import { DocumentPermission } from './document-permission.schema';

export type RoleDocument = Role & mongoose.Document;

@Schema()
export class Permission {
    _id: mongoose.Schema.Types.ObjectId;
    @Prop({ type: mongoose.Types.ObjectId, ref: DocumentPermission.name, unique: true })
    documentPermission: DocumentPermission;
    @Prop()
    enabledPermissions: TPermission[];
    @Prop({ default: false })
    onlyForCreator: boolean;
}
const PermissionSchema = SchemaFactory.createForClass(Permission);

@Schema()
export class Role {
    _id: mongoose.Schema.Types.ObjectId;
    @Prop({ required: true, unique: true, index: true })
    name: string;
    @Prop({ required: true, default: 'inactive' })
    status: string;
    @Prop()
    description?: string;
    @Prop({ required: true, default: 0 })
    ordering: number;
    @Prop({ type: [{ type: PermissionSchema }] })
    permissions: Permission[];
    @Prop({ default: new Date().toISOString() })
    createdAt?: string;
    @Prop()
    updatedAt?: string;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
