import {
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
import { CheckPolicies, PoliciesGuard } from 'src/guards/policies.guard';
import { SystemNotificationsService } from '../notifications/services/system-notifications.service';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment, CommentDocument } from './schemas/comment.schema';

@ApiTags('comments')
@Controller('comments')
export class CommentsController extends BaseController<Comment, CommentDocument> {
    constructor(
        private readonly commentsService: CommentsService,
        private readonly systemNotificationsService: SystemNotificationsService
    ) {
        super(commentsService);
    }

    @Get(':courseId/:unitId/fetch')
    fetchUnitComments(
        @Param('courseId') courseId: string,
        @Param('unitId') unitId: string,
        @Query() query: ClientQueryDto
    ) {
        return this.commentsService.fetchUnitComments(courseId, unitId, query);
    }

    @Get(':courseId/:unitId/:parentId/fetch-sub')
    fetchUnitSubComments(
        @Param('courseId') courseId: string,
        @Param('unitId') unitId: string,
        @Param('parentId') parentId: string
    ) {
        return this.commentsService.fetchUnitSubComments(courseId, unitId, parentId);
    }

    @Get(':courseId/:unitId/count')
    countUnitComments(
        @Param('courseId') courseId: string,
        @Param('unitId') unitId: string,
        @Query() query: ClientQueryDto
    ) {
        return this.commentsService.countUnitComments(courseId, unitId, query);
    }

    // FETCHES
    @Get()
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard)
    protected async fetchAll(@Query() query: ClientQueryDto): Promise<Comment[]> {
        return super.findAll(query);
    }
    //
    @Get('count')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('read', 'Comment'))
    @UsePipes(new ValidationPipe({ transform: true }))
    async count(@Query() query: ClientQueryDto): Promise<number> {
        return super.count(query);
    }
    //
    @Get(':id')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard)
    async fetchById(@Param('id') id: string): Promise<Comment> {
        return super.findById(id);
    }
    // CREATE
    @Post()
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard)
    async create(@Req() req, @Body() data: CreateCommentDto) {
        const createResult = await this.commentsService.create({ ...data, user: req.user._id });
        this.systemNotificationsService.newComment(createResult);
        return createResult;
    }
    // UPDATE
    @Patch(':id')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard)
    update(@Param('id') id: string, @Body() data: UpdateCommentDto) {
        return this.commentsService.updateById(id, data);
    }
    // DELETE
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    async deleteRecord(@Param('id') id: string): Promise<Comment> {
        return super.deleteOne(id);
    }
}
