import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IMomoPaymentExtraData, MomoService } from 'src/common/shared/services/momo.service';
import { ConfigurationService } from 'src/resources/configuration/configuration.service';
import { MoneyConfiguration } from 'src/resources/configuration/schemas/configuration.schema';
import { CoursesService } from 'src/resources/courses/services/courses.service';
import { OrderPaymentsService } from 'src/resources/payments/services/order-payments.service';
import { UserCourseService } from 'src/resources/user-course/user-course.service';
import { Cart } from 'src/resources/users/schemas/user.schema';
import { UsersService } from 'src/resources/users/users.service';
import TestCheckoutDto from '../dto/test-checkout.dto';
import { CourseInOrder, Order, OrderDocument } from '../schemas/order.schema';
import { OrdersService } from './orders.service';

@Injectable()
export class OrdersPaymentService extends OrdersService {
    constructor(
        @InjectModel(Order.name) protected orderModel: Model<OrderDocument>,
        private usersService: UsersService,
        private userCourseService: UserCourseService,
        private coursesService: CoursesService,
        private orderPaymentsService: OrderPaymentsService,
        private configurationService: ConfigurationService,
        private momoService: MomoService
    ) {
        super(orderModel);
    }

    private async saveCheckoutData(
        data: IMomoPaymentExtraData,
        moneyConfiguration: MoneyConfiguration,
        date?: Date
    ) {
        const coursesInOrder: CourseInOrder[] = data.courses.map((item) => {
            const { price, salePrice } = item;
            return {
                course: item._id as any,
                salePrice,
                price,
            };
        });
        const saveData: Partial<Order> = {
            coursesInOrder: coursesInOrder,
            totalPrice: data.amount,
            moneyConfiguration,
            history: {
                createdBy: data.userId as any,
                createdAt: date ? date.toDateString() : undefined,
            },
        };
        return super.create(saveData);
    }

    async testHandleCheckout(data: IMomoPaymentExtraData, date?: Date) {
        const configuration = await this.configurationService.fetch();
        await this.usersService.handleCheckout(data, date);
        await this.orderPaymentsService.testHandleCheckout(data, configuration.money, date);
        return this.saveCheckoutData(data, configuration.money, date);
    }

    async handleCheckout(data: IMomoPaymentExtraData, date?: Date) {
        const configuration = await this.configurationService.fetch();
        await this.usersService.handleCheckout(data, date);
        await this.coursesService.handleCheckout(data);
        await this.orderPaymentsService.handleCheckout(data, configuration.money);
        return this.saveCheckoutData(data, configuration.money, date);
    }

    async testCheckout(data: TestCheckoutDto) {
        const learns = await this.userCourseService.model.find({
            user: data.userId,
            course: {
                $in: data.courseIds,
            },
        });
        if (learns.length > 0) {
            throw new BadRequestException('course already enrolled');
        }
        const user = await this.usersService.model.findById(data.userId);
        const courses = await this.coursesService.model.find({
            _id: {
                $in: data.courseIds,
            },
        });

        if (!user || courses.length == 0) {
            throw new BadRequestException();
        }
        const cart: Cart = {
            courses,
        };
        const paymentMethodData = this.momoService.getPaymentMethodDataForUser(user, cart);
        const extraData = await this.momoService.parsePaymentExtraData(paymentMethodData);
        await this.testHandleCheckout(extraData, new Date(data.date));
    }
}
