import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsString } from "class-validator";

export class RefreshTokenDto {
    @ApiProperty()
    @IsDefined()
    @IsString()
    refreshToken: string
}