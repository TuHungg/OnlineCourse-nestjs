import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsDefined, IsMongoId } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class HandleCartCourseDto {
    @ApiProperty()
    @IsDefined()
    @IsMongoId()
    courseId: string;
}
