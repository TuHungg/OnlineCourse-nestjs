import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpCode,
    Post,
    Put,
    Query,
    Req,
    Request,
    Res,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import ControllerHelper from 'src/common/utils/helpers/ControllerHelper';
import Helper from 'src/common/utils/helpers/helper.helper';
import { MailService } from 'src/mail/mail.service';
import { ResetPasswordDto } from 'src/resources/users/dto/update-user.dto';
import { UsersService } from 'src/resources/users/users.service';
import { SignUpDto } from './../resources/users/dto/sign-up.dto';
import { VerifyEmailDto } from './../resources/users/dto/verify-email.dto';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private usersService: UsersService,
        private mailService: MailService,
        private configService: ConfigService
    ) {}

    // PROTECTED
    @Get('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    async profile(@Request() req) {
        const user = await this.usersService.getAuthUserById(req.user._id);
        if (!!user) return user.profile;
        throw new BadRequestException();
    }

    // REFRESH TOKEN
    @Post('refresh-token')
    async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
        const user = await this.authService.getUserByRefreshToken(refreshTokenDto.refreshToken);
        if (user) {
            const token = this.authService.genAccessToken(user);
            return token;
        }
        throw new UnauthorizedException();
    }

    @Post('login')
    @UseGuards(LocalAuthGuard)
    @ApiBody({ type: LoginDto })
    async login(@Request() req) {
        const tokens = this.authService.genTokens(req.user);
        return tokens;
    }

    @Post('verify-recaptcha')
    async verifyRecaptcha(@Body() data) {
        const result = await this.authService.verifyRecaptcha(data);
        if (!!result?.success) return true;
        return false;
    }

    // SIGN UP
    @Post('sign-up')
    async signup(@Body() data: SignUpDto) {
        // Send mail sign-up
        const user = await this.authService.localSignUp(data);
        if (!!user) {
            this.mailService.signUp(user);
            return true;
        }
        throw new BadRequestException('email existed');
    }

    @Post('sign-up')
    async verifyemail(@Body() data: SignUpDto) {
        // Send mail sign-up
        const user = await this.authService.localSignUp(data);
        if (!!user) {
            this.mailService.signUp(user);
            return true;
        }
        throw new BadRequestException('email existed');
    }

    @Post('verify-email')
    async verifyEmail(@Body() data: VerifyEmailDto) {
        const result = await this.authService.verifyEmail(data.code);
        return ControllerHelper.handleUpdateResult(result);
    }

    @Get('verify-email')
    async verifyEmailGet(@Res() res: Response, @Query('code') code: string) {
        const result = await this.authService.verifyEmail(code);
        const success = ControllerHelper.handleUpdateResult(result);
        if (success) {
            return res.redirect(
                `${this.configService.get('domain.client')}/join/login?messageType=email-verified`
            );
        }
    }

    @Post('forgot-password')
    @HttpCode(204)
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        const { email } = dto;
        const token = Helper.genRandomHash();
        const user = await this.usersService.model
            .findOneAndUpdate(
                { email },
                {
                    permissionCode: token,
                    permissionCodeTimestamp: new Date().toISOString(),
                },
                {
                    new: true,
                }
            )
            .exec();
        if (!!user) {
            await this.mailService.forgotPassword(user);
        }
    }

    @Get('is-valid-permission-code')
    async isValidPermissionCode(@Query('code') code: string): Promise<boolean> {
        if (code) {
            return this.authService.isValidPermissionCode(code);
        }
        return false;
    }

    @Put('reset-password')
    async resetPassword(@Body() data: ResetPasswordDto) {
        const result = await this.authService.updatePassword(data);
        return ControllerHelper.handleUpdateResult(result);
    }

    // LOCAL LOGIN
    @Get('logout')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    async logout(@Request() req) {
        this.authService.logout(req.user);
    }

    // GOOGLE LOGIN
    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleAuth() {
        return;
    }

    @Get('google/redirect')
    @UseGuards(GoogleAuthGuard)
    googleAuthRedirect(@Request() req, @Res({ passthrough: true }) res: Response) {
        // redirect back to waiting path when logged
        const { waitingRedirectPath = '' } = req.cookies;
        if (waitingRedirectPath) res.clearCookie('waitingRedirectPath');
        const tokens = this.authService.genTokens(req.user);
        return res.redirect(
            `${this.configService.get('domain.client')}/${waitingRedirectPath}?logged-token=${
                tokens.refreshToken
            }`
        );
    }

    // GET AUTH USE BY JWT TOKEN
    @Get('user')
    @UseGuards(JwtAuthGuard)
    authUser(@Req() req) {
        this.usersService.updateLastLoggonById(req.user._id);
        return this.usersService.getAuthUserById(req.user._id);
    }
}
