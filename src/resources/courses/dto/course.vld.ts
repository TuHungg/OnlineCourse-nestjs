import { Type } from "class-transformer";
import { IsString, MinLength, MaxLength, IsNumber, Min, Max, Matches, ArrayMaxSize, ArrayMinSize, IsArray, ValidateNested } from "class-validator";
import { ValidatorComposer } from "src/common/shared/validators/shared.vld";


export function IsCourseTitle({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsString(),
        MaxLength(80)
    ])({ required });
}

export function IsCourseSubtitle({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsString(),
        MaxLength(1000)
    ])({ required });
}

export function IsCourseDescription({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsString(),
        MaxLength(10000)
    ])({ required });
}

export function IsCoursePrice({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsNumber(),
        Min(0),
        Max(100000000)
    ])({ required });
}
export function IsCourseDiscount({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsNumber(),
        Min(0),
        Max(100)
    ])({ required });
}

export function IsCourseLan({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsString(),
        Matches(/en|vi/)
    ])({ required });
}

export function IsCourseCurrency({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsString(),
        Matches(/usd|vnd/)
    ])({ required });
}

// DETAILS
export function IsCourseSuitableLearner({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsString(),
        MaxLength(255)
    ])({ required });
}

// SECTION

export function IsCourseSectionTitle({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsString(),
        MaxLength(255)
    ])({ required });
}

export function IsCourseSectionObjective({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsString(),
        MaxLength(200)
    ])({ required });
}

export function IsCourseSectionNumLectures({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsNumber(),
        Min(0),
    ])({ required });
}

export function IsCourseSectionLength({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsNumber(),
    ])({ required });
}

export function IsUnitType({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsString(),
        Matches(/lecture|quiz/)
    ])({ required });
}

// META
export function IsStudentCount({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsNumber(),
        Min(0)
    ])({ required });
}

export function IsRatingCount({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsNumber(),
        Min(0)
    ])({ required });
}

export function IsRatingAvgScore({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsNumber(),
        Min(0),
        Max(5)
    ])({ required });
}

// MESSAGES
export function IsCourseWelcomeMessage({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsString(),
        MaxLength(255)
    ])({ required });
}

export function IsCourseCongratulationsMessage({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsString(),
        MaxLength(255)
    ])({ required });
}
