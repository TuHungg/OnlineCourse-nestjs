import {
    TDocumentName,
    TDocumentType,
    TPermission,
} from './../../../common/utils/constants/role.constant';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type DocumentPermissionDocument = DocumentPermission & mongoose.Document;

@Schema()
export class DocumentPermission {
    _id: mongoose.Schema.Types.ObjectId;
    @Prop({ unique: true, required: true })
    name: TDocumentName;
    @Prop({ required: true })
    type: TDocumentType;
    @Prop({ default: [] })
    permissions: TPermission[];
    @Prop({ default: 0 })
    ordering: number;
}

export const DocumentPermissionSchema = SchemaFactory.createForClass(DocumentPermission);
