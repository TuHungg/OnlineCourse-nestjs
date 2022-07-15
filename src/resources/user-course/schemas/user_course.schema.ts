import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { HistoryTimestampType } from 'src/common/shared/schemas/shared.schema';
import { Course } from 'src/resources/courses/schemas/course.schema';
import { Lecture } from 'src/resources/lectures/schemas/lecture.schema';
import { Question, Quiz } from 'src/resources/quizzes/schemas/quiz.schema';
import { User } from 'src/resources/users/schemas/user.schema';
import { QuestionDocument } from './../../quizzes/schemas/quiz.schema';

export type UserCourseDocument = UserCourse & mongoose.Document;

@Schema({ _id: false })
class QuestionAnswer {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Question.name })
    question: QuestionDocument;
    @Prop()
    answerNo: number;
}
export const QuestionAnswerSchema =
    SchemaFactory.createForClass(QuestionAnswer);

@Schema({ _id: false })
class LearnQuiz {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Quiz.name })
    quiz: Quiz;
    @Prop({ type: [{ type: QuestionAnswerSchema }], default: [] })
    questionAnswers: QuestionAnswer[];
    @Prop({
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: Question.name }],
    })
    skipQuestions: QuestionDocument[];
    @Prop()
    currentQuestionIdx: number;

    @Prop({ default: 'idle' })
    status: 'done' | 'doing' | 'idle';
}

@Schema({ _id: false })
class LearnLecture {
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: Lecture.name,
        required: true,
    })
    lecture: Lecture;
    @Prop({ default: 0 })
    videoTimeStamp: number;
}

@Schema()
export class LearnUnit {
    @Prop({ required: true })
    unitId: string;
    @Prop()
    learnQuiz?: LearnQuiz;
    @Prop()
    learnLecture?: LearnLecture;
    @Prop({ default: false })
    isCompleted: boolean;
}

const LearnUnitSchema = SchemaFactory.createForClass(LearnUnit);
export type LearnUnitDocument = LearnUnit & mongoose.Document;

@Schema({ _id: false })
class LearnDetail {
    @Prop({
        default: [],
        type: [{ type: LearnUnitSchema }],
    })
    learnUnits: LearnUnitDocument[];
    @Prop({
        type: [{ type: String }, { type: String }],
    })
    activeContentIds: [string, string];
    @Prop({ default: 0 })
    progress: number;
}

@Schema({ _id: false })
export class Archived {
    @Prop({ default: false })
    isArchived: boolean;
    @Prop()
    timestamp?: string;
}

@Schema()
export class UserCourse {
    _id: mongoose.Schema.Types.ObjectId;
    @Prop()
    salePrice: number;
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: Course.name,
        required: true,
    })
    course: Course;
    @Prop({
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: User.name,
    })
    user: User;
    @Prop({ required: true, default: {} })
    learnDetail: LearnDetail;
    @Prop({ default: {} })
    archived: Archived;
    @Prop({ default: {} })
    timestamps: HistoryTimestampType;
}

export const UserCourseSchema = SchemaFactory.createForClass(UserCourse);
