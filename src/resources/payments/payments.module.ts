import { NotificationsModule } from './../notifications/notifications.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CaslModule } from 'src/casl/casl.module';
import { SharedModule } from 'src/common/shared/shared.module';
import { CoursesModule } from '../courses/courses.module';
import { TransactionsModule } from './../transactions/transactions.module';
import { PaymentsController } from './controllers/payments.controller';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { InstructorPaymentsService } from './services/instructor-payments.service';
import { OrderPaymentsService } from './services/order-payments.service';
import { PaymentsService } from './services/payments.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Payment.name,
                schema: PaymentSchema,
            },
        ]),
        SharedModule,
        CaslModule,
        TransactionsModule,
        CoursesModule,
        NotificationsModule,
    ],
    controllers: [PaymentsController],
    providers: [PaymentsService, InstructorPaymentsService, OrderPaymentsService],
    exports: [PaymentsService, InstructorPaymentsService, OrderPaymentsService],
})
export class PaymentsModule {}
