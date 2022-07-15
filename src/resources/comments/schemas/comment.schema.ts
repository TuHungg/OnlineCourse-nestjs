import {
    AsyncModelFactory,
    Prop,
    Schema,
    SchemaFactory,
} from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { HistoryTimestampType } from 'src/common/shared/schemas/shared.schema';
import { Unit } from 'src/resources/courses/schemas/course.schema';
import { User } from 'src/resources/users/schemas/user.schema';
import {
    Course,
    CourseDocument,
    UnitDocument,
} from './../../courses/schemas/course.schema';
import { UserDocument } from './../../users/schemas/user.schema';

const { Types } = mongoose.Schema;

export type CommentDocument = Comment & mongoose.Document;

@Schema()
export class Comment {
    _id: mongoose.Schema.Types.ObjectId;
    @Prop({ type: Types.ObjectId, ref: Course.name, default: null })
    course: CourseDocument;
    @Prop({ type: Types.ObjectId, ref: Unit.name, default: null })
    unit: UnitDocument;
    @Prop({ type: Types.ObjectId, ref: Comment.name, default: null })
    parent?: CommentDocument;
    @Prop({ require: true })
    content: string;
    @Prop({ require: true, type: Types.ObjectId, ref: User.name })
    user: UserDocument;
    // @Prop()
    // reaction?: ReactionType;
    @Prop({ default: {} })
    timestamps: HistoryTimestampType;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

export const CommentAsyncModelFactory: AsyncModelFactory = {
    name: Comment.name,
    useFactory: () => {
        const schema = CommentSchema;
        schema.pre<Comment>('remove', async function (next) {
            const doc = this as CommentDocument;
            const model = (doc as any).model('Comment');
            await model.deleteMany({
                parent: doc._id,
            });
            next();
        });
        return schema;
    },
};
