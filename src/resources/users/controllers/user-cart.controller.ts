import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Req,
    ServiceUnavailableException,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MomoService } from 'src/common/shared/services/momo.service';
import { ACCESS_TOKEN_KEY } from 'src/common/utils/constants/app.constant';
import ControllerHelper from 'src/common/utils/helpers/ControllerHelper';
import Helper from 'src/common/utils/helpers/helper.helper';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { HandleCartCourseDto } from '../dto/handle-cart-course.dto';
import { UsersService } from '../users.service';
import { UpdateCartDto } from './../dto/update-cart.dto';

@ApiTags('users/cart')
@Controller('users/cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth(ACCESS_TOKEN_KEY)
export class UserCartController {
    constructor(
        private readonly usersService: UsersService,
        private readonly momoService: MomoService
    ) {}

    @Patch()
    async update(@Req() req, @Body() dto: UpdateCartDto) {
        const result = await this.usersService.updateCart(req.user._id, dto.courses);
        return ControllerHelper.handleUpdateResult(result, false);
    }

    @Delete(':courseId')
    deleteCourseInCart(@Req() req, @Param('courseId') courseId: string) {
        return this.usersService.deleteCourseInCart(req.user._id, courseId);
    }

    @Post('checkout-momo')
    async checkoutWithMomo(@Req() req) {
        const cart = await this.usersService.fetchCart(req.user._id);
        const authUser = await this.usersService.getAuthUserById(req.user._id);
        const result = await this.momoService.getPaymentMethodForUser(authUser, cart);
        if (result) return result.payUrl;
        throw new ServiceUnavailableException();
    }

    @Post('test-checkout-momo')
    async testCheckoutWithMomo(@Req() req) {
        const cart = await this.usersService.fetchCart(req.user._id);
        const authUser = await this.usersService.getAuthUserById(req.user._id);
        const data = this.momoService.getPaymentMethodDataForUser(authUser, cart);
        const queryString = Helper.genQueryString(data);
        const url = `${process.env.API_DOMAIN}/orders-payment/test-payment-notify?${queryString}`;
        return url;
    }

    //
    @Get()
    cart(@Req() req) {
        return this.usersService.fetchCart(req.user._id);
    }

    @Post()
    addCourseToCart(@Req() req, @Body() data: HandleCartCourseDto) {
        return this.usersService.addCourseToCart(req.user._id, data.courseId);
    }
}
