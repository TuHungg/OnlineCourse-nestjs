import { AsyncModelFactory, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { HistoryType } from 'src/common/shared/schemas/shared.schema';

const { Types } = mongoose.Schema;
export type CategoryDocument = Category & mongoose.Document;
export type TCategoryStatus = 'active' | 'inactive';

@Schema()
export class Category {
    _id: mongoose.Schema.Types.ObjectId;
    @Prop({ require: true })
    name: string;
    @Prop({ require: true, unique: true, index: true })
    slug: string;
    @Prop({ type: Types.ObjectId, ref: Category.name, default: null })
    parent?: Category;
    @Prop({ required: true, default: 'inactive' as TCategoryStatus })
    status?: TCategoryStatus;
    @Prop({ required: true, default: {} })
    history: HistoryType;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
export const CategoryAsyncModelFactory: AsyncModelFactory = {
    name: Category.name,
    useFactory: () => {
        const schema = CategorySchema;
        schema.pre<Category>('save', function (next) {
            console.warn('category:save()');
            next();
        });
        schema.pre<Category>('remove', function (next) {
            console.warn('category:remove()');
            next();
        });
        return schema;
    },
};
