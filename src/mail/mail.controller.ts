import { MailerService } from '@nestjs-modules/mailer';
import { Controller } from '@nestjs/common';

@Controller('email')
export class MailController {
    constructor(private mailService: MailerService) {}
}
