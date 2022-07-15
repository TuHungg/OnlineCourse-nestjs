import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Query,
    Request,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import moment from 'moment';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AppAbility } from 'src/casl/casl-ability.factory';
import { BaseController } from 'src/common/shared/base-controller';
import { ClientQueryDto } from 'src/common/shared/dtos/client-query.dto';
import { IdsDto } from 'src/common/shared/dtos/ids.dto';
import { ACCESS_TOKEN_KEY } from 'src/common/utils/constants/app.constant';
import ControllerHelper from 'src/common/utils/helpers/ControllerHelper';
import { CheckPolicies, PoliciesGuard } from 'src/guards/policies.guard';
import { SystemNotificationsService } from '../notifications/services/system-notifications.service';
import { UsersService } from '../users/users.service';
import { MailService } from './../../mail/mail.service';
import { ActivityLogsService } from './activity-logs.service';
import { HandleActivityDto } from './dto/handle-activity.dto';
import { ActivityLog, ActivityLogDocument } from './schemas/activity-logs.schema';

@ApiTags('activity-logs')
@Controller('activity-logs')
export class ActivityLogsController extends BaseController<ActivityLog, ActivityLogDocument> {
    constructor(
        private readonly activityLogsService: ActivityLogsService,
        private readonly mailService: MailService,
        private readonly systemNotificationsService: SystemNotificationsService,
        private readonly usersService: UsersService
    ) {
        super(activityLogsService);
    }

    // FETCHES
    @Get()
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('read', 'Activity Log'))
    protected async fetchAll(@Query() query: ClientQueryDto): Promise<ActivityLog[]> {
        return super.findAll(query);
    }
    //
    @Get('count')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('read', 'Activity Log'))
    @UsePipes(new ValidationPipe({ transform: true }))
    async count(@Query() query: ClientQueryDto): Promise<number> {
        return super.count(query);
    }
    //
    @Get(':id')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('read', 'Activity Log'))
    async fetchById(@Param('id') id: string): Promise<ActivityLog> {
        return super.findById(id);
    }
    //
    @Post('handle-activity')
    async handleActivity(@Request() req, @Body() dto: HandleActivityDto) {
        const userAgent = req.headers['user-agent'];
        const ip = ControllerHelper.getClientIp(req);

        const user = !!dto.authTokens?.refreshToken
            ? await this.usersService.model.findOne(
                  {
                      refreshToken: dto.authTokens.refreshToken,
                  },
                  { _id: 1 }
              )
            : null;
        if (!this.isOwnner(ip) && user?._id != process.env.OWNER_ID) {
            const result = await this.activityLogsService.handleActivity(dto, {
                ip,
                userAgent,
                user,
            });
            const activityLog = await result.populate('user');
            // send notify mail if needed
            this.sendNewActivityMailIfNeeded(activityLog);
        }
    }

    private async sendNewActivityMailIfNeeded(activityLog: ActivityLog) {
        const lastActivity = await this.activityLogsService.model
            .findOne({
                'deviceInfo.ip': activityLog.deviceInfo.ip,
            })
            .skip(1);
        if (!!lastActivity) {
            const diffH = moment(activityLog.timestamp).diff(lastActivity.timestamp, 'hour');
            if (diffH >= 1) {
                this.sendNotification(activityLog);
            }
        } else {
            this.sendNotification(activityLog);
        }
    }

    private sendNotification(activityLog: ActivityLog) {
        this.systemNotificationsService.newActivitty(activityLog);
        this.mailService.newActivity(activityLog);
    }
    private isOwnner(clientIp: string) {
        const ownerIp = process.env.OWNER_IP_ADDRESS || '';
        const whitelist = ownerIp.split(',');
        return whitelist.indexOf(clientIp) > -1;
    }
    // DELETE
    @Delete('records')
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @CheckPolicies((ability: AppAbility) => ability.can('delete', 'Activity Log'))
    async deleteRecords(@Query() ids: IdsDto): Promise<ActivityLog[]> {
        return super.deleteMany(ids);
    }
    //
    @Delete(':id')
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @CheckPolicies((ability: AppAbility) => ability.can('delete', 'Activity Log'))
    async deleteRecord(@Param('id') id: string): Promise<ActivityLog> {
        return super.deleteOne(id);
    }
}
