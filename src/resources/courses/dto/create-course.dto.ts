import { Optional } from '@nestjs/common';
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
import { HistoryProp } from 'src/common/shared/dtos/shared.dto';
import {
    IsCourseCongratulationsMessage,
    IsCourseCurrency,
    IsCourseDescription,
    IsCourseDiscount,
    IsCourseLan,
    IsCoursePrice,
    IsCourseSectionLength,
    IsCourseSectionNumLectures,
    IsCourseSectionObjective,
    IsCourseSectionTitle,
    IsCourseSubtitle,
    IsCourseTitle,
    IsCourseWelcomeMessage,
    IsRatingAvgScore,
    IsRatingCount,
    IsStudentCount,
    IsUnitType,
} from './course.vld';

export class BasicInfo {
    @ApiProperty({ required: false })
    @IsCourseTitle()
    title?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    slug?: string;

    @ApiProperty({ required: false })
    @IsCourseSubtitle()
    subtitle?: string;

    @ApiProperty({ required: false })
    @IsCourseDescription()
    description?: string;

    @ApiProperty({ required: false })
    @IsCoursePrice()
    price?: number;

    @ApiProperty({ required: false })
    @IsCourseLan()
    lan?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    level?: string;

    @ApiProperty({ required: false })
    @IsCourseCurrency()
    currency?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isFree?: number;

    @ApiProperty({ required: false })
    @IsCourseDiscount()
    discount?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    image?: number;
}

export type TUnitType = 'lecture' | 'quiz';
export class Unit {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsMongoId()
    lecture?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsMongoId()
    quiz?: string;

    @ApiProperty({ required: false })
    @IsUnitType()
    type?: TUnitType;
}

export class Section {
    @ApiProperty({ required: false })
    @IsCourseSectionTitle()
    title?: string;

    @ApiProperty({ required: false })
    @IsCourseSectionObjective()
    objective?: string;

    @ApiProperty({ required: false })
    @IsCourseSectionNumLectures()
    numLectures?: number;

    @ApiProperty({ required: false })
    @IsCourseSectionLength()
    duration?: number;

    @ApiProperty({
        required: false,
        isArray: true,
        type: Unit,
    })
    @Optional()
    @ValidateNested({ each: true })
    @Type(() => Unit)
    units?: Unit[];
}

export class Details {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString({ each: true })
    requirements?: string[];

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString({ each: true })
    objectives?: string[];

    @ApiProperty({
        required: false,
        isArray: true,
        type: Section,
    })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => Section)
    sections?: Section[];

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString({ each: true })
    suitableLearner?: string[];
}

export class Meta {
    @ApiProperty({ required: false })
    @IsStudentCount()
    studentCount?: number;

    @ApiProperty({ required: false })
    @IsRatingAvgScore()
    ratingAvgScore?: number;

    @ApiProperty({ required: false })
    @IsRatingCount()
    ratingCount?: number;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    contentVideoLength?: number;
}

export class Messages {
    @ApiProperty({ required: false })
    @IsCourseWelcomeMessage()
    welcome?: string;

    @ApiProperty({ required: false })
    @IsCourseCongratulationsMessage()
    congratulation?: string;
}

export class Promotions {
    @ApiProperty()
    @IsBoolean()
    @IsDefined()
    enabled: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    discountPrice?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    startAt?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    endAt?: string;
}

export class CreateCourseDto {
    _id: string;
    @ApiProperty({ required: false })
    @IsOptional()
    @IsMongoId({ each: true })
    categories?: string[];

    @ApiProperty({ required: false })
    @IsOptional()
    @IsMongoId({ each: true })
    topics?: string[];

    @ApiProperty({ required: false })
    @IsOptional()
    @IsMongoId({ each: true })
    reviews?: string[];

    @ApiProperty({ required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => BasicInfo)
    basicInfo?: BasicInfo;

    @ApiProperty({ required: false })
    @ValidateNested()
    @Type(() => Details)
    details?: Details;

    @ApiProperty({ required: false })
    @ValidateNested()
    @Type(() => Meta)
    meta?: Meta;

    @ApiProperty({ required: false })
    @ValidateNested()
    @Type(() => Messages)
    promotions?: Messages;

    @ApiProperty({ required: false })
    @ValidateNested()
    @Type(() => Messages)
    messages?: Messages;

    @ApiProperty()
    @IsDefined()
    @ValidateNested()
    @Type(() => HistoryProp)
    history: HistoryProp;
}
