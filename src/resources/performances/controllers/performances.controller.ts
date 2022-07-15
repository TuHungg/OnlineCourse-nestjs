import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AppAbility } from 'src/casl/casl-ability.factory';
import { ClientQueryDto } from 'src/common/shared/dtos/client-query.dto';
import { ACCESS_TOKEN_KEY } from 'src/common/utils/constants/app.constant';
import { CheckPolicies, PoliciesGuard } from 'src/guards/policies.guard';
import { Course } from 'src/resources/courses/schemas/course.schema';
import AcpCoursesService from 'src/resources/courses/services/acp-courses.service';
import { User } from 'src/resources/users/schemas/user.schema';
import { UsersService } from 'src/resources/users/users.service';

@Controller('performances')
@ApiTags('performances')
export class PerformancesController {
    constructor(
        private readonly acpCoursesService: AcpCoursesService,
        private readonly usersService: UsersService
    ) {}

    @Get('/active-courses')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('read', 'Course'))
    protected async fetchActiveCourses(@Query() query: ClientQueryDto): Promise<Course[]> {
        return this.acpCoursesService.fetchActiveCourses(query);
    }

    @Get('/count-active-courses')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('read', 'Course'))
    protected async countActiveCourses(@Query() query: ClientQueryDto): Promise<number> {
        return this.acpCoursesService.countActiveCourses(query);
    }

    @Get('/instructors')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('view', 'Performances'))
    protected async fetchInstructors(@Query() query: ClientQueryDto): Promise<User[]> {
        return this.usersService.getInstructors(query);
    }

    @Get('/count-instructors')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('view', 'Performances'))
    protected async countInstructors(@Query() query: ClientQueryDto): Promise<number> {
        return this.usersService.countInstructors(query);
    }
    //
}
