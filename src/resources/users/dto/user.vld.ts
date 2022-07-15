import { Type } from 'class-transformer';

import { IsEmail, IsString, MaxLength } from "class-validator";
import { ValidatorComposer } from "src/common/shared/validators/shared.vld";

export function IsUserEmail({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsEmail()
    ])({ required });
}
export function IsUserPassword({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsString(),
    ])({ required });
}
export function IsUserStatus({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsString(),
    ])({ required });
}
export function IsFirstName({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsString(),
        MaxLength(255)
    ])({ required });
}
export function IsLastName({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsString(),
        MaxLength(255)
    ])({ required });
}
export function IsFullName({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsString(),
        MaxLength(255)
    ])({ required });
}
export function IsPhone({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsString(),
    ])({ required });
}
export function IsAddress({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsString(),
    ])({ required });
}
export function IsListName({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsString(),
        MaxLength(255)
    ])({ required });
}

