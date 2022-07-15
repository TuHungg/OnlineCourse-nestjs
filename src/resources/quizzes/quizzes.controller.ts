import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from 'src/common/shared/base-controller';
import { CreateQuizDto, QuestionDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { QuizzesService } from './quizzes.service';
import { Quiz, QuizDocument } from './schemas/quiz.schema';

@ApiTags('quizzes')
@Controller('quizzes')
export class QuizzesController extends BaseController<Quiz, QuizDocument> {
    constructor(private readonly quizzesService: QuizzesService) {
        super(quizzesService);
    }

    @Post()
    create(@Body() createQuizDto: CreateQuizDto) {
        return this.quizzesService.create(createQuizDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateQuizDto: UpdateQuizDto) {
        return this.quizzesService.updateById(id, updateQuizDto);
    }

    @Patch('add-question/:id')
    addQuestion(@Param('id') id: string, @Body() data: QuestionDto) {
        return this.quizzesService.addQuestion(id, data);
    }
    @Patch('update-question/:id/:questionId')
    updateQuestion(
        @Param('id') id: string,
        @Param('questionId') questionId: string,
        @Body() data: QuestionDto,
    ) {
        return this.quizzesService.updateQuestion(id, questionId, data);
    }
    @Patch('delete-question/:id/:questionId')
    deleteQuestion(
        @Param('id') id: string,
        @Param('questionId') questionId: string,
    ) {
        return this.quizzesService.deleteQuestion(id, questionId);
    }
}
