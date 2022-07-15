import { IsDefined, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export function ValidatorComposer(validators: PropertyDecorator[]): (options: { required: boolean }) => PropertyDecorator {
    return function ({ required }: { required: boolean } = { required: false }) {
        return function (target: any,
            propertyKey: string | symbol): void {
            if (!required) IsOptional()(target, propertyKey);
            else IsDefined()(target, propertyKey)
            validators.forEach((validator) => validator(target, propertyKey));
        }
    }
}

export function IsSlug({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsString(),
    ])({ required });
}

export function IsOrdering({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsNumber(),
        Min(0),
        Max(1000),
    ])({ required });
}