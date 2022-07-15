import { IsString, MinLength, MaxLength, IsUrl, Matches, IsOptional, IsNumber } from "class-validator";
import { ValidatorComposer } from "src/common/shared/validators/shared.vld";

export function IsMyUrl({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsUrl(),
    ])({ required });
}

export function IsFileName({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsString(),
        MaxLength(255)
    ])({ required });
}
export function IsFileSize({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsNumber(),
    ])({ required });
}
export function IsFileDuration({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsNumber(),
    ])({ required });
}

export function IsFileStatus({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsString()
        // Matches(/video|image|audio/),
    ])({ required });
}
export function IsFileType({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsString()
        // Matches(/video|image|audio/),
    ])({ required });
}