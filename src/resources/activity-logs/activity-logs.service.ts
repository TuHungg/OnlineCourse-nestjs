import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import DeviceDetector from 'device-detector-js';
import { Model } from 'mongoose';
import dummy_activity_logs from 'src/common/dummy_data/dummy_activity_logs';
import { BaseModel, IEmbedOption } from 'src/common/shared/base-model';
import { User } from '../users/schemas/user.schema';
import { UsersService } from './../users/users.service';
import { HandleActivityDto } from './dto/handle-activity.dto';
import { ActivityLog, ActivityLogDocument } from './schemas/activity-logs.schema';

@Injectable()
export class ActivityLogsService extends BaseModel<ActivityLog, ActivityLogDocument> {
    protected searchFields: string[] = ['user.email', 'user.profile.fullName', 'content'];
    protected basicEmbedOptions: IEmbedOption[] = [
        {
            path: 'user',
        },
    ];
    protected detailEmbedOptions: IEmbedOption[] = [...this.basicEmbedOptions];
    protected displayFields: string[] = ['_id', 'user', 'deviceInfo', 'content', 'timestamp'];

    get dummyData(): any[] {
        return dummy_activity_logs;
    }

    constructor(
        @InjectModel(ActivityLog.name)
        private readonly activityLogModel: Model<ActivityLogDocument>,
        private readonly usersService: UsersService
    ) {
        super('activitylogs', activityLogModel);
    }

    async handleActivity(
        dto: HandleActivityDto,
        data: { ip: string; userAgent: string; user?: User }
    ): Promise<ActivityLogDocument> {
        const deviceDetector = new DeviceDetector();
        const device = deviceDetector.parse(data.userAgent);
        // nottify
        const payload: Partial<ActivityLog> = {
            content: dto.content,
            deviceInfo: {
                ip: data.ip,
                geolocationInfo: dto.geolocationInfo,
                ...device,
            } as any,
            user: data.user?._id as any,
            timestamp: new Date().toISOString(),
        };
        return this.create(payload);
    }
}
