import { ApiProperty } from "@nestjs/swagger";
import { IsDefined } from "class-validator";

export class IdsDto {
    @ApiProperty({
        name: 'ids'
    })
    @IsDefined()
    ids: string
}