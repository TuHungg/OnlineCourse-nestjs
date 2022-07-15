import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ACCESS_TOKEN_KEY } from 'src/common/utils/constants/app.constant';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { UpdateLearnUnitDto } from '../../user-course/dto/update-learn-unit-dto';
import { UserCourseService } from '../../user-course/user-course.service';
import { UsersService } from '../users.service';

@ApiTags('users/learning')
@Controller('users/learning')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth(ACCESS_TOKEN_KEY)
export class UserLearningController {
    constructor(
        private readonly usersService: UsersService,
        private readonly userCourseService: UserCourseService
    ) {}

    @Patch('/completed-unit/:userCourseId/:unitId')
    completedLecture(@Param('userCourseId') userCourseId: string, @Param('unitId') unitId: string) {
        return this.userCourseService.completedUnit(userCourseId, unitId);
    }

    @Patch('/uncompleted-unit/:userCourseId/:unitId')
    uncompletedLecture(
        @Param('userCourseId') userCourseId: string,
        @Param('unitId') unitId: string
    ) {
        return this.userCourseService.uncompletedUnit(userCourseId, unitId);
    }

    //
    @Get(':userCourseId/learn-unit/:unitId')
    fetchLearnUnit(
        @Param('userCourseId') userCourseId: string,
        @Param('unitId') learnUnitId: string
    ) {
        return this.userCourseService.fetchLearnUnit(userCourseId, learnUnitId);
    }

    @Patch(':userCourseId/learn-unit/:unitId')
    updateLearnUnit(
        @Param('userCourseId') userCourseId: string,
        @Param('unitId') unitId: string,
        @Body() data: UpdateLearnUnitDto
    ) {
        return this.userCourseService.updateLearnUnit(userCourseId, unitId, data);
    }

    //

    @Get('fetch-by-slug/:courseSlug')
    async fetchLearnCourseBySlug(@Req() req, @Param('courseSlug') courseSlug: string) {
        return this.userCourseService.fetchItemBySlug(req.user._id, courseSlug);
    }
    @Get(':courseId')
    async fetchLearnCourse(@Req() req, @Param('courseId') courseId: string) {
        return this.userCourseService.fetchItem(req.user._id, courseId);
    }
}
