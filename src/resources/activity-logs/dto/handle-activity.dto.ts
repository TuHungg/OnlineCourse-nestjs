import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class AuthTokens {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    refreshToken?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    accessToken?: string;
}
class GeolocationDto {
    @ApiProperty()
    @IsNumber()
    @IsDefined()
    lat: number;

    @ApiProperty()
    @IsNumber()
    @IsDefined()
    long: number;
}
class GeolocationInfoDto {
    @ApiProperty({ required: false })
    @ValidateNested()
    @Type(() => GeolocationDto)
    @IsOptional()
    geolocation?: GeolocationDto;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    message: string;
}
export class HandleActivityDto {
    @ApiProperty()
    @ValidateNested()
    @Type(() => GeolocationInfoDto)
    @IsDefined()
    geolocationInfo: GeolocationInfoDto;

    @ApiProperty()
    @IsString()
    @IsDefined()
    content: string;

    @ApiProperty()
    @ValidateNested()
    @Type(() => AuthTokens)
    @IsDefined()
    authTokens: AuthTokens;
}
