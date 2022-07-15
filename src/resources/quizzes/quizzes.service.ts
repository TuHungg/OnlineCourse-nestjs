import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import dummy_quizzes from 'src/common/dummy_data/dummy_quizzes';
import { BaseModel } from 'src/common/shared/base-model';
import Helper from 'src/common/utils/helpers/helper.helper';
import { QuestionDto } from './dto/create-quiz.dto';
import { Question, QuestionDocument, Quiz, QuizDocument } from './schemas/quiz.schema';

@Injectable()
export class QuizzesService extends BaseModel<Quiz, QuizDocument>{
    get dummyData(): any[] {
        return dummy_quizzes;
    }

    constructor(
        @InjectModel(Quiz.name) protected quizModel: Model<QuizDocument>,
    ) {
        super('quizzes', quizModel)
    }
    async addQuestion(id: string, data: QuestionDto): Promise<Question> {
        const item = await this.quizModel.findById(id);
        const length = item.questions.push(data as any);
        await item.save();
        const newItem = await this.quizModel.findById(id);
        return newItem.questions[length - 1];
    }
    async updateQuestion(id: string, questionId: string, data: QuestionDto): Promise<Question> {
        const item = await this.quizModel.findById(id);
        const questionIdx = item.questions.findIndex(item => item._id == questionId);
        if (questionIdx > -1) {
            const payload: QuestionDocument = {
                ...item.questions[questionIdx],
                ...data,
            } as QuestionDocument
            item.questions[questionIdx] = payload;
            await item.save();
            const newItem = await this.quizModel.findById(id);
            return newItem.questions[questionIdx];
        }
    }

    async deleteQuestion(id: string, questionId: string): Promise<QuestionDocument> {
        const item = await this.quizModel.findById(id);
        const questionIdx = item.questions.findIndex(item => item._id == questionId);
        if (questionIdx > -1) {
            const [deletedQuestion] = item.questions.splice(questionIdx, 1);
            await item.save();
            return deletedQuestion;
        }
    }
}
