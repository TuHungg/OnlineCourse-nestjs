import { ConfigService } from '@nestjs/config';
import { NotificationsModule } from './../notifications/notifications.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MomoService } from 'src/common/shared/services/momo.service';
import { ConfigurationModule } from '../configuration/configuration.module';
import { PaymentsModule } from '../payments/payments.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { CaslModule } from './../../casl/casl.module';
import { SharedModule } from './../../common/shared/shared.module';
import { CoursesModule } from './../courses/courses.module';
import { UserCourseModule } from './../user-course/user-course.module';
import { UsersModule } from './../users/users.module';
import { OrdersPaymentController } from './controllers/orders-payment.controller';
import { OrdersController } from './controllers/orders.controller';
import { Order, OrderSchema } from './schemas/order.schema';
import { OrdersPaymentService } from './services/orders-payment.service';
import { OrdersService } from './services/orders.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Order.name,
                schema: OrderSchema,
            },
        ]),
        UsersModule,
        CoursesModule,
        SharedModule,
        CaslModule,
        PaymentsModule,
        TransactionsModule,
        ConfigurationModule,
        UserCourseModule,
        NotificationsModule,
    ],
    controllers: [OrdersController, OrdersPaymentController],
    providers: [OrdersService, OrdersPaymentService, MomoService, ConfigService],
    exports: [OrdersService],
})
export class OrdersModule {}
