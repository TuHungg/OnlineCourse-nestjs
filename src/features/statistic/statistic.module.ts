import { TransactionsModule } from './../../resources/transactions/transactions.module';
import { Module } from '@nestjs/common';
import { TransactionsStatisticService } from './services/transactions-statistic.service';

@Module({
    imports: [TransactionsModule],
    providers: [TransactionsStatisticService],
    exports: [TransactionsStatisticService],
})
export class StatisticModule {}
