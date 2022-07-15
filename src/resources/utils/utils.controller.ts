import { Controller } from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { UsersService } from './../users/users.service';

@Controller('utils')
export class UtilsController {
    constructor(private mailService: MailService, private usersService: UsersService) {}
}
