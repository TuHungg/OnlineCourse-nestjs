import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Module({
    imports: [
        MailerModule.forRootAsync({
            useFactory: async () => ({
                transport: {
                    host: 'smtp.gmail.com',
                    port: 465,

                    auth: {
                        user: process.env.MAIL_USERNAME,
                        pass: process.env.MAIL_PASSWORD,
                    },
                },
                defaults: {
                    from: '"Online Course" <onlincourse.hsu@gmail.com>',
                },

                // template: {
                //     dir: join(__dirname, 'templates'),
                //     adapter: new HandlebarsAdapter(),
                //     options: {
                //         strict: true,
                //     },
                // },
            }),

            // useFactory: async (config: ConfigService) => ({
            // }),
            // inject: [ConfigService],
        }),
    ],
    providers: [MailService, ConfigService],
    exports: [MailService],
})
export class MailModule {}
