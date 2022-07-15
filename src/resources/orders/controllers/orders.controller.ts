import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Query,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AppAbility } from 'src/casl/casl-ability.factory';
import { BaseController } from 'src/common/shared/base-controller';
import { ClientQueryDto } from 'src/common/shared/dtos/client-query.dto';
import { PoliciesGuard, CheckPolicies } from 'src/guards/policies.guard';
import { ACCESS_TOKEN_KEY } from '../../../common/utils/constants/app.constant';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { Order, OrderDocument } from '../schemas/order.schema';
import { OrdersService } from '../services/orders.service';

@ApiTags('orders')
@Controller('orders')
export class OrdersController extends BaseController<Order, OrderDocument> {
    constructor(private readonly ordersService: OrdersService) {
        super(ordersService);
    }
    // FETCHES
    @Get()
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('read', 'Order'))
    protected async fetchAll(@Query() query: ClientQueryDto): Promise<Order[]> {
        return super.findAll(query);
    }
    //
    @Get('count')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('read', 'Order'))
    @UsePipes(new ValidationPipe({ transform: true }))
    async count(@Query() query: ClientQueryDto): Promise<number> {
        return super.count(query);
    }
    //
    @Get(':id')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('read-own', 'Order'))
    async fetchById(@Param('id') id: string): Promise<Order> {
        return this.ordersService.getOrderDetail(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
        return this.ordersService.updateById(id, updateOrderDto);
    }
}
