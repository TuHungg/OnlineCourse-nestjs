import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { Response } from 'express';
import lodash from 'lodash';
import moment from 'moment';
import { STUDENT_ID } from 'src/common/utils/constants/data.constant';
import { Provider } from 'src/common/utils/constants/enums';
import Helper from 'src/common/utils/helpers/helper.helper';
import { Role } from 'src/resources/roles/schemas/role.schema';
import { SignUpDto } from 'src/resources/users/dto/sign-up.dto';
import { ResetPasswordDto } from 'src/resources/users/dto/update-user.dto';
import { User } from 'src/resources/users/schemas/user.schema';
import { UsersService } from 'src/resources/users/users.service';
import { CreateUserDto } from './../resources/users/dto/create-user.dto';
import { UserDocument } from './../resources/users/schemas/user.schema';
import { VerifyRecaptchaDto } from './dto/varify-recaptcha.dto';
import IAuthTokens from './interfaces/auth-tokens.interface';
import { IGoogleLoggedResult } from './interfaces/google-logged-result.interface';
import { IGoogleUser } from './interfaces/google-user.interface';
import IJwtUser from './interfaces/jwt-user.interface';

@Injectable()
export class AuthService {
    private verificationCodeLength = 6;
    private verificationExpireInMinute = 30;

    constructor(private readonly usersService: UsersService, private jwtService: JwtService) {}

    async verifyEmail(code: string) {
        const user = await this.usersService.model.findOne({ permissionCode: code });
        if (!!user) {
            const diffMinutes = moment().diff(user.permissionCodeTimestamp, 'minutes');
            if (diffMinutes <= this.verificationExpireInMinute) {
                return this.usersService.model.updateOne(
                    { _id: user._id },
                    {
                        $set: {
                            status: 'active',
                        },
                        $unset: {
                            permissionCode: '',
                            permissionCodeTimestamp: '',
                        },
                    }
                );
            } else {
                this.usersService.model.updateOne(
                    {
                        _id: user._id,
                    },
                    {
                        $unset: {
                            permissionCode: '',
                            permissionCodeTimestamp: '',
                        },
                    }
                );
            }
        }
        throw new BadRequestException();
    }

    async isValidPermissionCode(code: string) {
        const user = await this.usersService.model.findOne({ permissionCode: code }).exec();
        if (!!user) {
            const diffMinutes = moment().diff(user.permissionCodeTimestamp, 'minutes');
            if (diffMinutes <= this.verificationExpireInMinute) {
                return true;
            }
        }
        return false;
    }
    async updatePassword(data: ResetPasswordDto) {
        const isValid = await this.isValidPermissionCode(data.token);
        if (isValid) {
            const password = Helper.md5(data.password);
            return this.usersService.model.updateOne(
                { permissionCode: data.token },
                {
                    $set: { password },
                    $unset: { permissionCode: '', permissionCodeTimestamp: '' },
                }
            );
        } else {
            this.usersService.model.updateOne(
                {
                    permissionCode: data.token,
                },
                {
                    $unset: {
                        permissionCode: '',
                        permissionCodeTimestamp: '',
                    },
                }
            );
        }
        return null;
    }

    async localSignUp(data: SignUpDto) {
        const { firstName, lastName, email, password } = data;
        // check
        const existingItem = await this.usersService.model.findOne({
            email: data.email,
        });
        if (!existingItem) {
            // email not exist => create new
            const user = await this.usersService.create({
                profile: {
                    firstName,
                    lastName,
                },
                status: 'unverified',
                email,
                password,
                providers: ['password'],
                role: STUDENT_ID as unknown as Role,
                //
                permissionCode: Helper.genRandomNumber(this.verificationCodeLength),
                permissionCodeTimestamp: new Date().toISOString(),
            });
            return user;
        } else if (existingItem.status == 'unverified') {
            // email exist => reassign permission code
            const data = {
                profile: {
                    firstName,
                    lastName,
                },
                password,
                permissionCode: Helper.genRandomNumber(this.verificationCodeLength),
                permissionCodeTimestamp: new Date().toISOString(),
            };
            const user = await this.usersService.updateById(existingItem._id, data);
            return user;
        }
        return null;
    }

    async validateUser(email: string, pass: string): Promise<User | null> {
        const user: User = await this.usersService.loginWithEmailAndPassword(email, pass);
        if (user) {
            return user;
        }
        return null;
    }

    async handleGoogleLoggedResult(ggUser: IGoogleUser): Promise<IGoogleLoggedResult> {
        let user: UserDocument = await this.usersService.loginWithEmail(ggUser.email);

        // exist
        if (user) {
            if (!user.providers.includes(Provider.GOOGLE)) {
                const data = {
                    providers: [...user.providers, Provider.GOOGLE],
                };
                if (!user.profile.avatar) lodash.set(data, 'profile.avatar', ggUser.picture);
                user = await this.usersService.updateById(user._id, data);

                return { isNew: false, user };
            }
            return { isNew: false, user };
        }

        // create new
        const userData: CreateUserDto = {
            email: ggUser.email,
            status: 'active',
            profile: {
                firstName: ggUser.firstName,
                lastName: ggUser.lastName,
                avatar: ggUser.picture,
            },
            providers: [Provider.GOOGLE],
            role: STUDENT_ID,
            refreshToken: Helper.genRandomHash(),
        };
        (await this.usersService.create(userData)) as UserDocument;
        user = await this.usersService.loginWithEmail(ggUser.email);
        return { isNew: true, user };
    }

    //
    async getAuthUserById(id: string) {
        return this.usersService.getAuthUserById(id);
    }

    async getUserByRefreshToken(refreshToken: string) {
        return this.usersService.getAuthUserByRefreshToken(refreshToken);
    }

    // HANDLE JWT LOGIN
    genTokens(user: UserDocument) {
        const token = {
            refreshToken: user.refreshToken,
            accessToken: this.genAccessToken(user),
        };
        return token;
    }

    async logout(user: UserDocument): Promise<void> {
        this.usersService.deleteFields({ _id: user._id }, ['refreshToken']);
    }

    setAuthTokenCookies(res: Response, tokens: IAuthTokens) {
        res.cookie('refreshToken', tokens.refreshToken);
        res.cookie('accessToken', tokens.accessToken);
    }

    genAccessToken(user: User): string {
        const sub: IJwtUser = {
            _id: user._id + '',
            email: user.email,
            // profile: user.profile,
            role: {
                _id: user.role._id + '',
                permissions: user.role.permissions,
                name: user.role.name,
            },
        };
        return this.jwtService.sign({ sub });
    }

    async verifyRecaptcha(data: VerifyRecaptchaDto) {
        const { secret, response } = data;
        const result = await axios
            .post(
                'https://www.google.com/recaptcha/api/siteverify',
                `secret=${secret}&response=${response}`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            )
            .then((res) => res.data);

        return result;
    }
}
