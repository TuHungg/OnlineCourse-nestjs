import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { BaseController } from 'src/common/shared/base-controller'
import { ACCESS_TOKEN_KEY } from 'src/common/utils/constants/app.constant'
import { JwtAuthGuard } from './../../auth/guards/jwt-auth.guard'
import { UserCourse, UserCourseDocument } from './schemas/user_course.schema'
import { UserCourseService } from './user-course.service'

@ApiTags('user-course')
@Controller('user-course')
export class UserCourseController extends BaseController<UserCourse, UserCourseDocument> {
    constructor(private readonly userCourseService: UserCourseService) {
        super(userCourseService)
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    update(@Param('id') id: string, @Body() data: any) {
        return this.userCourseService.updateById(id, data)
    }
}
