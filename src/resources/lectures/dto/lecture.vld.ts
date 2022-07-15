import { IsString, MinLength, MaxLength } from "class-validator";
import { ValidatorComposer } from "src/common/shared/validators/shared.vld";

export function IsLectureTitle({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsString(),
        MaxLength(255)
    ])({ required });
}

export function IsResourceName({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsString(),
        MaxLength(255)
    ])({ required });
}
