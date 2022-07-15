import { HistoryTimestampProp } from './../../../common/shared/dtos/shared.dto';
import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsArray, IsBoolean, IsDefined, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator"
import { HistoryProp } from "src/common/shared/dtos/shared.dto"
import { IsAnswerContent, IsOptionNumber, IsQuestionContent } from "./quiz_vld"

class AnswerOption {
    @ApiProperty()
    @IsAnswerContent({ required: true })
    answerContent: string

    @ApiProperty()
    @IsOptionNumber({ required: true })
    optionNo: number

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string
}

export class QuestionDto {
    @ApiProperty()
    @IsQuestionContent()
    questionContent: string

    @ApiProperty({
        required: false,
        isArray: true,
        type: AnswerOption
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AnswerOption)
    answerOptions: AnswerOption[]

    @ApiProperty()
    @IsDefined()
    @IsNumber()
    correctOptionNo: number
}

export class CreateQuizDto {
    @ApiProperty()
    @IsDefined()
    @IsString()
    title: string

    @ApiProperty({
        isArray: true,
        type: QuestionDto

    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuestionDto)
    questions?: QuestionDto[]

    @ApiProperty()
    @ValidateNested()
    @Type(() => HistoryTimestampProp)
    history?: HistoryTimestampProp
}