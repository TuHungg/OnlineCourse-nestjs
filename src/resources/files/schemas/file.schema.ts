import {
    Schema,
    Prop,
    SchemaFactory,
    AsyncModelFactory,
} from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { HistoryType } from 'src/common/shared/schemas/shared.schema';
import ModelHelper, {
    TRelatedFieldsToDoc,
} from 'src/common/utils/helpers/model-helper';

export type TMediaType = 'video' | 'image';
export type FileDocument = File & mongoose.Document;

@Schema()
export class File {
    _id: mongoose.Schema.Types.ObjectId;
    @Prop()
    url: string;
    @Prop()
    name: string;
    @Prop()
    status: string;
    @Prop()
    size: number;
    @Prop()
    type: string;
    // for video
    @Prop()
    thumbnailUrl?: string;
    @Prop()
    // for video
    duration?: number;
    @Prop({ required: true, default: {} })
    history: HistoryType;
}

export const FileSchema = SchemaFactory.createForClass(File);

const data: TRelatedFieldsToDoc[] = [
    {
        model: 'Lecture',
        fields: [
            {
                path: 'video',
                isArray: false,
            },
            {
                path: 'resources',
                isArray: true,
            },
        ],
    },
];

export const FileAsyncModelFactory: AsyncModelFactory = {
    name: File.name,
    useFactory: () => {
        const schema = FileSchema;
        schema.pre<File>('remove', async function (next) {
            const doc = this as FileDocument;
            await ModelHelper.deleteRelatedFieldsToDoc(doc, data);
            next();
        });
        return schema;
    },
};
