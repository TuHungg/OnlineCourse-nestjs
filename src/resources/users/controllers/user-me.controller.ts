import { Body, Controller, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ACCESS_TOKEN_KEY } from 'src/common/utils/constants/app.constant';
import ControllerHelper from 'src/common/utils/helpers/ControllerHelper';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { SystemNotificationsService } from './../../notifications/services/system-notifications.service';
import { UserMeService } from './../services/user-me.service';

@ApiTags('users/me')
@Controller('users/me')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth(ACCESS_TOKEN_KEY)
export class UsersMeController {
    constructor(
        private readonly userMeService: UserMeService,
        private systemNotificationsService: SystemNotificationsService
    ) {}

    // @Patch()
    // updateMe(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    //     return this.usersService.updateById(req.user._id, updateUserDto);
    // }

    @Patch('profile')
    updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto) {
        return this.userMeService.updateById(req.user._id, updateProfileDto);
    }

    @Patch('switch-to-instructor')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard)
    async switchToInstructor(@Req() req) {
        const result = await this.userMeService.switchToInstructor(req.user._id);
        this.systemNotificationsService.switchToInstructor(req.user);
        return ControllerHelper.handleUpdateResult(result);
    }
}
