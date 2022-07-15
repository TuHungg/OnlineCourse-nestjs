import { CaslModule } from './../../casl/casl.module';
import { Module } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { QuizzesController } from './quizzes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from 'src/common/shared/shared.module';
import { Quiz, QuizSchema } from './schemas/quiz.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Quiz.name,
                schema: QuizSchema,
            },
        ]),
        SharedModule,
        CaslModule,
    ],
    controllers: [QuizzesController],
    providers: [QuizzesService],
    exports: [QuizzesService],
})
export class QuizzesModule {}
