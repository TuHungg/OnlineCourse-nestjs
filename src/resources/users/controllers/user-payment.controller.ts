import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClientQueryDto } from 'src/common/shared/dtos/client-query.dto';
import { ACCESS_TOKEN_KEY } from '../../../common/utils/constants/app.constant';
import { User } from '../schemas/user.schema';
import { UserPaymentService } from './../services/user-payment.service';

@ApiTags('user-payment')
@Controller('user-payment')
@ApiBearerAuth(ACCESS_TOKEN_KEY)
export class UserPaymentsController {
    constructor(private userPaymentService: UserPaymentService) {}

    // FETCHES
    @Get('instructor-with-payment/:id')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    fetchInstructorWithPayment(@Param('id') userId: string): Promise<User> {
        return this.userPaymentService.getInstructorWithPayment(userId);
    }

    @Get('instructors-with-payment')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    // @UseGuards(JwtAuthGuard, PoliciesGuard)
    // @CheckPolicies((ability: AppAbility) => ability.can('read', 'User'))
    protected async fetchInstructorsWithPayment(@Query() query: ClientQueryDto): Promise<User[]> {
        return this.userPaymentService.getInstructorsWithPayment(query);
    }

    @Get('/count-instructors-with-payment')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    // @UseGuards(JwtAuthGuard, PoliciesGuard)
    // @CheckPolicies((ability: AppAbility) => ability.can('view', 'Performances'))
    protected async countInstructorsWithPayment(@Query() query: ClientQueryDto): Promise<number> {
        return this.userPaymentService.countInstructorsWithPayment(query);
    }
}
