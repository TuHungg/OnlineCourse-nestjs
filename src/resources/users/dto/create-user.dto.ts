import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsDateString,
    IsDefined,
    IsMongoId,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { IsMyUrl } from 'src/resources/files/dto/file.vld';
import { TUserStatus } from '../schemas/user.schema';
import {
    IsAddress,
    IsFirstName,
    IsLastName,
    IsListName,
    IsPhone,
    IsUserEmail,
    IsUserPassword,
    IsUserStatus,
} from './user.vld';

export class ProfileDto {
    @ApiProperty({ required: false })
    @IsMyUrl()
    avatar?: string;

    @ApiProperty({ required: false })
    @IsFirstName()
    firstName?: string;

    @ApiProperty({ required: false })
    @IsLastName()
    lastName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    fullName?: string;

    @ApiProperty({ required: false })
    @IsPhone()
    phone?: string;

    @ApiProperty({ required: false })
    @IsAddress()
    address?: string;
}

class CourseList {
    @ApiProperty({ required: false })
    @IsListName()
    name?: string;

    @ApiProperty({ required: false })
    @IsMongoId({ each: true })
    Course?: string[];
}

class MyCourses {
    @ApiProperty({ required: false })
    @IsMongoId({ each: true })
    learning?: string[];

    @ApiProperty({ required: false })
    @IsMongoId({ each: true })
    wishlist?: string[];

    @ApiProperty({ required: false })
    @IsMongoId({ each: true })
    archived?: string[];

    @ApiProperty({
        required: false,
        isArray: true,
        type: CourseList,
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CourseList)
    lists?: CourseList[];
}

export class CartDto {
    @ApiProperty()
    @IsDefined()
    @IsMongoId({ each: true })
    courses: string[];
}

export class CreateUserDto {
    @ApiProperty()
    @IsUserEmail({ required: true })
    email: string;

    @ApiProperty({ required: false })
    @IsUserPassword()
    password?: string;

    @ApiProperty({ required: false })
    @IsUserStatus()
    status?: TUserStatus;

    @ApiProperty()
    @IsDefined()
    @IsMongoId()
    role: string;

    @ApiProperty({ required: false })
    @Type(() => ProfileDto)
    @ValidateNested()
    profile?: ProfileDto;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString({ each: true })
    providers?: string[];

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    refreshToken?: string;

    @ApiProperty({ required: false })
    @Type(() => MyCourses)
    @ValidateNested()
    myCourses?: MyCourses;

    @ApiProperty({ required: false })
    @Type(() => CartDto)
    @ValidateNested()
    cart?: CartDto;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    createdAt?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    updatedAt?: string;
}
