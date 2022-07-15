import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/resources/users/schemas/user.schema';
import { APP_NAME } from './../common/utils/constants/app.constant';
import { ActivityLog } from './../resources/activity-logs/schemas/activity-logs.schema';

@Injectable()
export class MailService {
    constructor(
        private readonly mailerService: MailerService,
        private configService: ConfigService
    ) {}

    newActivity(activityLog: ActivityLog) {
        const {
            user,
            deviceInfo: {
                ip,
                geolocationInfo: { geolocation, message: geolocationMessage },
            },
        } = activityLog;
        const name = !!user ? user.profile.fullName : 'unknown';
        const mapLink = `https://www.google.com/maps/search/?api=1&query=${geolocation?.lat}, ${geolocation?.long}`;
        return this.mailerService.sendMail({
            to: process.env.MAIL_USERNAME,
            subject: `New Activity - ${name}`,
            html: `
            <p>Hi bro,</p>
            <p><strong>Viewer information</strong></p>
            <p>ip: ${ip}</p>
            ${!!user ? `<p>Name : ${user?.profile.fullName}</p>` : ''}
            ${!!user ? `<p>Email: ${user?.email}</p>` : ''}
            <p><strong>Geolocation</strong></p>
            <p>latitude: ${geolocation?.lat}</p>
            <p>longitude: ${geolocation?.long}</p>
            ${!!geolocation ? `<p><a href="${mapLink}">View user position (Map)</a></p>` : ''}
            ${geolocationMessage ? `<p>message: ${geolocationMessage}</p>` : ''}
            `,
        });
    }
    signUp(user: User) {
        const link = `${this.configService.get('domain.api')}/auth/verify-email?code=${
            user.permissionCode
        }`;
        return this.mailerService.sendMail({
            to: user.email,
            subject: 'Welcome to Online Courses!',
            html: `
            <p>Hi ${user.profile.firstName},</p>
            <p>Thank you for signing up for <a href="${this.configService.get(
                'domain.client'
            )}"><strong>${APP_NAME}</strong></a>.</p>
            <p>Your verification code is <strong>${user.permissionCode}</strong>.</p>
            <p>Or you can click <a href="${link}"><strong>here</strong></a> to activate your account.</p>
            <p><i>* These code and link only works within 30 minutes.</i></p>
            `,
        });
    }

    forgotPassword(user: User) {
        const link = `${this.configService.get('domain.client')}/join/reset-password/?token=${
            user.permissionCode
        }`;
        return this.mailerService.sendMail({
            to: user.email,
            subject: 'Reset password',
            html: `
            <p>Hi ${user.profile.fullName},</p>
            <p>- A password reset event has been triggered. The password reset window is limited to 30 minutes.</p>
            <p>- If you do not reset your password within 30 minutes, you will need to submit a new request.</p>
            <p>- To complete the password reset process, click <a href="${link}"><strong>here</strong></a>.</p>
            <p>Thank you and good a nice day.</p>`,
        });
    }
}
