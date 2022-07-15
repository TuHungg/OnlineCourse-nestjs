import { IsMongoId } from 'class-validator';
import { IsDefined, ValidateNested } from 'class-validator';
import { IsNumber } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger"
import { CreateFileDto } from 'src/resources/files/dto/create-file.dto';
import { Type } from 'class-transformer';

export class CreateCourseLectureVideoDto {
    @ApiProperty()
    @IsDefined()
    @IsMongoId()
    lectureId: string

    @ApiProperty()
    @IsDefined()
    @ValidateNested()
    @Type(() => CreateFileDto)
    data: CreateFileDto
}