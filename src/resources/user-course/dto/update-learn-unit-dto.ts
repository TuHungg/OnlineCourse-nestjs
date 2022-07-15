import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsDefined,
    IsMongoId,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';

class QuestionAnswer {
    @ApiProperty()
    @IsDefined()
    @IsMongoId()
    question: string;

    @ApiProperty()
    @IsDefined()
    @Type(() => Number)
    @IsNumber()
    answerNo: number;
}

class LearnQuizDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsMongoId()
    quiz?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @ValidateNested({
        each: true,
    })
    @Type(() => QuestionAnswer)
    questionAnswers?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsMongoId({ each: true })
    skipQuestions?: string[];

    @ApiProperty({ required: false })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    currentQuestionIdx?: number;

    @ApiProperty()
    @IsString()
    @IsOptional()
    status?: string;
}

export class UpdateLearnUnitDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsMongoId()
    unitId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => LearnQuizDto)
    learnQuiz?: LearnQuizDto;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isCompleted?: boolean;
}
