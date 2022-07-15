import { IsNumber, Min, Max } from "class-validator";
import { ValidatorComposer } from "src/common/shared/validators/shared.vld";

export function IsOrderPrice({ required }: { required: boolean } = { required: false }): PropertyDecorator {
    return ValidatorComposer([
        IsNumber(),
        Min(0),
        Max(100000000)
    ])({ required });
}