import { IsString, MinLength, MaxLength, IsNumber, Min } from "class-validator";
import { ValidatorComposer } from "src/common/shared/validators/shared.vld";

export function IsAnswerContent({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsString(),
        MaxLength(255)
    ])({ required });
}
export function IsQuestionContent({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsString(),
        MaxLength(255)
    ])({ required });
}
export function IsOptionNumber({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsNumber(),
        Min(0),
    ])({ required });
}

