import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
export class AuthTokens {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    refreshToken: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    accessToken: string;
}
export class Pos {
    @ApiProperty()
    @IsNumber()
    @IsDefined()
    lat: number;

    @ApiProperty()
    @IsNumber()
    @IsDefined()
    long: number;
}
export class HiDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => Pos)
    pos?: Pos;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    message?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @ValidateNested()
    @Type(() => AuthTokens)
    authTokens?: AuthTokens;
}
