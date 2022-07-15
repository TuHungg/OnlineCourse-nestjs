import { IsNumber, IsString, Max, MaxLength, Min } from "class-validator";
import { ValidatorComposer } from "src/common/shared/validators/shared.vld";

export function IsReviewContent({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsString(),
        MaxLength(1000)
    ])({ required });
}
export function IsReviewRating({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsNumber(),
        Min(1),
        Max(5)
    ])({ required });
}
