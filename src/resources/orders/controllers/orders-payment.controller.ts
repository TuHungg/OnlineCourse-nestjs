import { Controller, Get, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import TestCheckoutDto from '../dto/test-checkout.dto';
import { OrdersPaymentService } from '../services/orders-payment.service';
import { IMomoPaymentCourse, MomoService } from './../../../common/shared/services/momo.service';
import { SystemNotificationsService } from './../../notifications/services/system-notifications.service';

@ApiTags('orders-payment')
@Controller('orders-payment')
export class OrdersPaymentController {
    constructor(
        private ordersPaymentService: OrdersPaymentService,
        private momoService: MomoService,
        private readonly systemNotificationsService: SystemNotificationsService,
        private readonly configService: ConfigService
    ) {}
    // TEST
    @Get('test-checkout')
    testCheckout(@Query() query: TestCheckoutDto) {
        return this.ordersPaymentService.testCheckout(query);
    }

    @Get('test-payment-notify')
    async testPaymentNotify(@Query() query, @Res() res: Response) {
        const extraData = this.momoService.parsePaymentExtraData(query);
        await this.ordersPaymentService.handleCheckout(extraData);
        this.sendNewEnrollmentNotifications(extraData.userId, extraData.courses);
        return this.redirectToEnrolledCourses(res);
    }
    //
    @Get('payment-notify')
    async paymentNotify(@Query() query, @Res() res: Response) {
        try {
            switch (query.resultCode) {
                case '0':
                    // SUCCESS
                    const extraData = this.momoService.parsePaymentExtraData(query);
                    await this.ordersPaymentService.handleCheckout(extraData);
                    this.sendNewEnrollmentNotifications(extraData.userId, extraData.courses);
                    return this.redirectToEnrolledCourses(res);
            }
        } catch (e) {
            console.error('failed to handle payment result');
        }
        return res.redirect(`${this.configService.get('domain.client')}/cart`);
    }

    private redirectToEnrolledCourses(res: Response) {
        return res.redirect(
            `${this.configService.get(
                'domain.client'
            )}/my-courses/all?messageType=checkout-succeeded`
        );
    }

    private async sendNewEnrollmentNotifications(studentId: string, courses: IMomoPaymentCourse[]) {
        await Promise.all(
            courses.map((course) => {
                return this.systemNotificationsService.newEnrollment(studentId, course._id);
            })
        );
    }
}
