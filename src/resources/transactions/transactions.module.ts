import { CoursesModule } from './../courses/courses.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CaslModule } from 'src/casl/casl.module';
import { SharedModule } from 'src/common/shared/shared.module';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Transaction.name,
                schema: TransactionSchema,
            },
        ]),
        SharedModule,
        CaslModule,
        CoursesModule,
    ],
    controllers: [TransactionsController],
    providers: [TransactionsService],
    exports: [TransactionsService],
})
export class TransactionsModule {}
