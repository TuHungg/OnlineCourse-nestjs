import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AppAbility } from 'src/casl/casl-ability.factory';
import { BaseController } from 'src/common/shared/base-controller';
import { ClientQueryDto } from 'src/common/shared/dtos/client-query.dto';
import { ACCESS_TOKEN_KEY } from 'src/common/utils/constants/app.constant';
import ControllerHelper from 'src/common/utils/helpers/ControllerHelper';
import { CheckPolicies, PoliciesGuard } from 'src/guards/policies.guard';
import { Course } from 'src/resources/courses/schemas/course.schema';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { CourseDocument } from '../schemas/course.schema';
import { CoursesService } from '../services/courses.service';
import FormCourseService from '../services/form-course.service';
import { SystemNotificationsService } from './../../notifications/services/system-notifications.service';
import { ApproveCourseDto } from './../dto/approve-course.dto';

@ApiTags('courses')
@Controller('courses')
export class CoursesController extends BaseController<Course, CourseDocument> {
    constructor(
        private readonly coursesService: CoursesService,
        private readonly formCourseService: FormCourseService,
        private readonly systemNotificationsService: SystemNotificationsService
    ) {
        super(coursesService);
    }

    @Get('brief/:id')
    fetchBriefById(@Param('id') id: string) {
        return this.coursesService.fetchBriefById(id);
    }

    @Get('/transform-dummy')
    transformDummy() {
        return this.coursesService.transformDummy();
    }
    @Get('/test')
    test() {
        return this.coursesService.test();
    }
    // FETCHES
    @Get()
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('read', 'Course'))
    protected async fetchAll(@Query() query: ClientQueryDto): Promise<Course[]> {
        return super.findAll(query);
    }
    //
    @Get('validate-deletion/:id')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('delete', 'Course'))
    async validateDeletion(@Param('id') id) {
        const validateResult = await this.vldDeletion(id);
        if (!!validateResult) {
            throw new BadRequestException(validateResult);
        }
        return true;
    }
    //
    @Get('count')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('read', 'Course'))
    @UsePipes(new ValidationPipe({ transform: true }))
    async count(@Query() query: ClientQueryDto): Promise<number> {
        return super.count(query);
    }
    //
    @Get(':id')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('read-own', 'Course'))
    async fetchById(@Param('id') id: string): Promise<Course> {
        return super.findById(id);
    }
    // CREATE
    @Post()
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('create-own', 'Course'))
    create(@Body() data: CreateCourseDto) {
        return this.coursesService.create(data);
    }
    // UPDATE
    @Patch('submit-for-review/:courseId')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('update-own', 'Course'))
    async submitForReview(@Req() req, @Param('courseId') courseId: string) {
        const result = await this.coursesService.submitForReview(req.user._id, courseId);
        return ControllerHelper.handleUpdateResult(result);
    }

    @Patch('convert-course-to-draft/:courseId')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('update-own', 'Course'))
    async convertCourseToDraft(@Req() req, @Param('courseId') courseId: string) {
        const result = await this.formCourseService.convertCourseToDraft(req.user._id, courseId);
        return ControllerHelper.handleUpdateResult(result);
    }

    @Patch('approve/:courseId')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('approve', 'Course'))
    async approve(@Req() req, @Param('courseId') courseId: string, @Body() data: ApproveCourseDto) {
        const result = await this.formCourseService.approve(req.user._id, courseId, data);
        if (result.modifiedCount > 0) {
            this.coursesService.model
                .findById(courseId)
                .populate('history.createdBy')
                .then((course) => {
                    this.systemNotificationsService.approveCourse(
                        course.history.createdBy,
                        courseId,
                        data.status
                    );
                });
        }
        return ControllerHelper.handleUpdateResult(result);
    }

    @Patch(':id')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('update-own', 'Course'))
    update(@Param('id') id: string, @Body() data: UpdateCourseDto) {
        return this.coursesService.updateById(id, data);
    }
    // DELETE
    // @Delete('records')
    // @UseGuards(JwtAuthGuard, PoliciesGuard)
    // @ApiBearerAuth(ACCESS_TOKEN_KEY)
    // @CheckPolicies((ability: AppAbility) => ability.can('delete', 'Course'))
    // async deleteRecords(@Query() ids: IdsDto): Promise<Course[]> {
    //     return super.deleteMany(ids);
    // }
    //
    @Delete(':id')
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @CheckPolicies((ability: AppAbility) => ability.can('delete-own', 'Course'))
    async deleteRecord(@Param('id') id: string): Promise<Course> {
        const vldResult = await this.vldDeletion(id);
        if (!vldResult) return super.deleteOne(id);
        throw new BadRequestException(vldResult);
    }

    private vldDeletion(id: string) {
        return this.coursesService.validateDeletion(id, 'usercourses', 'course');
    }
}
