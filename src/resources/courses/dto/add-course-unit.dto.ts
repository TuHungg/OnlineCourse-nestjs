import { CreateLectureDto } from './../../lectures/dto/create-lecture.dto';
import { IsNumber } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";
import { Type } from 'class-transformer';
import { IsDefined, IsMongoId, ValidateNested } from 'class-validator';
import { CreateQuizDto } from 'src/resources/quizzes/dto/create-quiz.dto';
import { IsUnitType } from './course.vld';
import { TUnitType } from './create-course.dto';

class Unit {

    @ApiProperty({ required: false })
    @ValidateNested()
    @Type(() => CreateLectureDto)
    lecture?: CreateLectureDto

    @ApiProperty({ required: false })
    @ValidateNested()
    @Type(() => CreateQuizDto)
    quiz?: CreateQuizDto

    @ApiProperty({ required: false })
    @IsUnitType()
    type?: TUnitType
}

export class AddCourseUnitDto {
    @ApiProperty()
    @IsDefined()
    @IsMongoId()
    sectionId: string

    @ApiProperty()
    @IsDefined()
    @IsNumber()
    unitIndex: number

    @ApiProperty()
    @ValidateNested()
    @Type(() => Unit)
    unit: Unit
}