import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { config } from 'dotenv';
import { Strategy } from 'passport-google-oauth20';
import { IGoogleUser } from '../interfaces/google-user.interface';
import { User } from './../../resources/users/schemas/user.schema';
import { AuthService } from './../auth.service';

config();

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private configService: ConfigService, private authService: AuthService) {
        super({
            clientID: configService.get('google.clientId'),
            clientSecret: configService.get('google.clientSecret'),
            callbackURL: `${configService.get('domain.api')}/auth/google/redirect`,
            scope: ['email', 'profile'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any): Promise<User> {
        const { name, emails, photos } = profile;
        const user: IGoogleUser = {
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            picture: photos[0].value,
            accessToken,
        };
        const result = await this.authService.handleGoogleLoggedResult(user);
        return this.authService.getAuthUserById(result.user._id);
    }
}
