import {
    BadRequestException,
    Body,
    Controller,
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
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { Payment, PaymentDocument } from '../schemas/payment.schema';
import { PaymentsService } from '../services/payments.service';
import { SystemNotificationsService } from './../../notifications/services/system-notifications.service';

@Controller('payments')
@ApiTags('payments')
export class PaymentsController extends BaseController<Payment, PaymentDocument> {
    constructor(
        private readonly paymentsService: PaymentsService,
        private readonly systemNotificationsService: SystemNotificationsService
    ) {
        super(paymentsService);
    }

    // FETCHES
    @Get()
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('read', 'Payment'))
    protected async fetchAll(@Query() query: ClientQueryDto): Promise<Payment[]> {
        return super.findAll(query);
    }
    //
    @Get('count')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('read', 'Payment'))
    @UsePipes(new ValidationPipe({ transform: true }))
    async count(@Query() query: ClientQueryDto): Promise<number> {
        return super.count(query);
    }
    //
    @Get(':id')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('read', 'Payment'))
    async fetchById(@Param('id') id: string): Promise<Payment> {
        return super.findById(id);
    }
    // UPDATE
    @Patch('pay/:paymentId')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('update', 'Payment'))
    async pay(@Req() req, @Param('paymentId') paymentId: string) {
        const result = await this.paymentsService.pay(req.user._id, paymentId);
        if (result.modifiedCount > 0) {
            this.systemNotificationsService.newPaidPayment(paymentId);
        }
        return ControllerHelper.handleUpdateResult(result);
    }
    @Patch('pay-all/:userId')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('update', 'Payment'))
    async payAll(@Req() req, @Param('userId') userId) {
        try {
            const paymentIds = await this.paymentsService.payAll(req.user._id, userId);
            paymentIds.forEach((id) => {
                this.systemNotificationsService.newPaidPayment(id);
            });
            return true;
        } catch (e) {
            throw new BadRequestException();
        }
    }
    // CREATE
    @Post()
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('create', 'Payment'))
    create(@Body() data: CreatePaymentDto) {
        return this.paymentsService.create(data);
    }
}
