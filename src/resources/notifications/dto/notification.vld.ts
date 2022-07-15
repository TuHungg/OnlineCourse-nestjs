import { IsString, Matches, MaxLength } from "class-validator";
import { ValidatorComposer } from "src/common/shared/validators/shared.vld";

export function IsNotificationType({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsString(),
    ])({ required });
}
export function IsNotificationMessage({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsString(),
        MaxLength(255),
    ])({ required });
}
