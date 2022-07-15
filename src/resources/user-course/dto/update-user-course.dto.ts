import { PartialType } from '@nestjs/swagger';
import { CreateUserCourseDto } from './create-user-course.dto';

export class UpdateUserCourseDto extends PartialType(CreateUserCourseDto) {}
