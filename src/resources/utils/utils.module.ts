import { UsersModule } from 'src/resources/users/users.module';
import { Module } from '@nestjs/common';
import { MailModule } from 'src/mail/mail.module';
import { UtilsController } from './utils.controller';

@Module({
    imports: [MailModule, UsersModule],
    controllers: [UtilsController],
})
export class UtilsModule {}
