import { IsString, MaxLength } from "class-validator";
import { ValidatorComposer } from "src/common/shared/validators/shared.vld";

export function IsCommentContent({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsString(),
        MaxLength(1000)
    ])({ required });
}
