import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { HistoryTimestampType } from './../../../common/shared/schemas/shared.schema';

export type QuizDocument = Quiz & mongoose.Document;

@Schema({ _id: false })
class AnswerOption {
    @Prop({ required: true })
    answerContent: string;
    @Prop({ required: true })
    optionNo: number;
    @Prop()
    description: string;
}

@Schema()
export class Question {
    @Prop({ required: true })
    questionContent: string;
    @Prop()
    answerOptions: AnswerOption[];
    @Prop({ required: true })
    correctOptionNo: number;
}

export type QuestionDocument = Question & mongoose.Document;
export const QuestionSchema = SchemaFactory.createForClass(Question);

@Schema()
export class Quiz {
    _id: mongoose.Schema.Types.ObjectId;
    @Prop({ required: true })
    title: string;
    @Prop()
    description?: string;
    @Prop({ type: [{ type: QuestionSchema }] })
    questions: QuestionDocument[];
    @Prop({ required: true, default: {} })
    history: HistoryTimestampType;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);
