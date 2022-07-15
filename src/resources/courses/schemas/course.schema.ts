import { AsyncModelFactory, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { HistoryType } from 'src/common/shared/schemas/shared.schema';
import { Category } from 'src/resources/categories/schemas/category.schema';
import { Topic } from 'src/resources/topics/schemas/topic.schema';
import { Lecture } from '../../lectures/schemas/lecture.schema';
import { Quiz } from '../../quizzes/schemas/quiz.schema';

const { Types } = mongoose.Schema;

export type CourseDocument = Course & mongoose.Document;

export type TCourseLevel = 'beginner' | 'intermediate' | 'expert' | 'all';
@Schema({ _id: false })
class BasicInfo {
    @Prop({ required: true, default: 'notitle' })
    title?: string;

    @Prop({ unique: true, trim: true, index: true, sparse: true })
    slug?: string;

    @Prop()
    subtitle?: string;

    @Prop()
    price?: number;

    @Prop()
    lan?: string;

    @Prop()
    level?: TCourseLevel;

    @Prop()
    currency?: string;

    @Prop({ default: false })
    isFree?: boolean;

    @Prop({ default: 0 })
    discount?: number;

    @Prop({})
    image?: string;
}

export type TUnitType = 'lecture' | 'quiz';
@Schema()
export class Unit {
    @Prop({ type: Types.ObjectId, ref: Lecture.name })
    lecture?: Lecture;

    @Prop({ type: Types.ObjectId, ref: Quiz.name })
    quiz?: Quiz;

    @Prop({ required: true, default: 'lecture' })
    type: TUnitType;
}

export type UnitDocument = Unit & mongoose.Document;
export const UnitSchema = SchemaFactory.createForClass(Unit);

@Schema()
export class Section {
    @Prop()
    title?: string;

    @Prop()
    objective?: string;

    @Prop()
    numLectures?: number;

    @Prop()
    duration?: number;

    @Prop({ type: [{ type: UnitSchema }] })
    units?: (Unit & mongoose.Document)[];
}
export type SectionDocument = Section & mongoose.Document;
export const SectionSchema = SchemaFactory.createForClass(Section);

@Schema({ _id: false })
class Details {
    @Prop()
    requirements?: string[];

    @Prop()
    objectives?: string[];

    @Prop({ type: [{ type: SectionSchema }] })
    sections?: (Section & mongoose.Document)[];

    @Prop()
    description?: string;

    @Prop()
    suitableLearner?: string[];
}

@Schema({ _id: false })
class Meta {
    @Prop({ default: 0 })
    studentCount?: number;

    @Prop({ default: 0 })
    avgRatingScore?: number;

    @Prop({ default: 0 })
    ratingCount?: number;

    @Prop({ default: 0 })
    contentVideoLength?: number;
}

@Schema({ _id: false })
class Messages {
    @Prop()
    welcome?: string;

    @Prop()
    congratulations?: string;
}

@Schema({ _id: false })
export class Promotions {
    @Prop({ required: true, default: false })
    enabled: boolean;

    @Prop()
    discountPrice: number;

    @Prop()
    startAt: string;

    @Prop()
    endAt: string;
}

@Schema({ _id: false })
export class CourseHistory extends HistoryType {
    @Prop()
    publishedAt?: string;
}

export type TCourseStatus = 'draft' | 'pending' | 'active' | 'rejected';
@Schema()
export class Course {
    _id: mongoose.Schema.Types.ObjectId;
    @Prop({ required: true, default: 'draft' as TCourseStatus })
    status: TCourseStatus;

    @Prop({ type: [{ type: Types.ObjectId }], ref: Category.name })
    categories?: Category[];

    @Prop({ type: [{ type: Types.ObjectId }], ref: Topic.name })
    topics?: Topic[];

    @Prop({ required: true, default: {} })
    basicInfo: BasicInfo;

    @Prop({ required: true, default: {} })
    details: Details;

    @Prop({ required: true, default: {} })
    meta: Meta;

    @Prop({ required: true, default: {} })
    messages: Messages;

    @Prop({ required: true, default: {} })
    promotions: Promotions;

    @Prop({ default: {} })
    history: CourseHistory;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
export const CourseAsyncModelFactory: AsyncModelFactory = {
    name: Course.name,
    useFactory: () => {
        const schema = CourseSchema;
        schema.pre<Course>('save', function (next) {
            console.warn('course:save()');
            next();
        });
        schema.pre<Course>('remove', function (next) {
            console.warn('course:remove()');
            next();
        });
        return schema;
    },
};
