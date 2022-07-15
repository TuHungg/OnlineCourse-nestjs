import { BadRequestException, Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ACCESS_TOKEN_KEY } from 'src/common/utils/constants/app.constant';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { UserCourseService } from '../../user-course/user-course.service';
import { ArchiveCoursesDto } from '../dto/archive-courses.dto';
import { UsersService } from '../users.service';
import { FavCoursesDto } from './../dto/fav-courses.dto';

@ApiTags('users/my-courses')
@Controller('users/my-courses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth(ACCESS_TOKEN_KEY)
export class UserMyCoursesController {
    constructor(
        private readonly usersService: UsersService,
        private readonly userCourseService: UserCourseService
    ) {}

    @Get('learning')
    async fetchLearningCourses(@Req() req) {
        return this.userCourseService.fetchLearningCourses(req.user._id);
    }

    @Get('learning-course-ids')
    async fetchLearningCourseIds(@Req() req) {
        return this.userCourseService.fetchLearningCourseIds(req.user._id);
    }

    @Get('archived')
    async fetchArchivedCourses(@Req() req) {
        return this.userCourseService.fetchArchivedCourses(req.user._id);
    }

    @Get('wishlist')
    async fetchWishlist(@Req() req) {
        return this.usersService.fetchWishlist(req.user._id);
    }

    @Get('count-wishlist')
    async countWishlist(@Req() req) {
        return this.usersService.countWishlist(req.user._id);
    }

    @Get('wishlist-course-ids')
    async fetchWishlistIds(@Req() req) {
        return this.usersService.fetchWishlistIds(req.user._id);
    }

    @Patch('archive')
    async archive(@Req() req, @Body() data: ArchiveCoursesDto) {
        const result = await this.userCourseService.archiveCourses(req.user._id, data);
        if (result.matchedCount == 0) throw new BadRequestException();
    }

    @Patch('unarchive')
    async unarchive(@Req() req, @Body() data: ArchiveCoursesDto) {
        const result = await this.userCourseService.unarchiveCourses(req.user._id, data);
        if (result.matchedCount == 0) throw new BadRequestException();
    }

    @Patch('add-to-wishlist')
    async addToWishlist(@Req() req, @Body() data: FavCoursesDto) {
        const result = await this.usersService.addToWishlist(req.user._id, data);
        if (result.matchedCount == 0) throw new BadRequestException();
    }

    @Patch('delete-from-wishlist')
    async deleteFromWishlist(@Req() req, @Body() data: FavCoursesDto) {
        const result = await this.usersService.deleteFromWishlist(req.user._id, data);
        if (result.matchedCount == 0) throw new BadRequestException();
    }
}
