import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AppAbility } from 'src/casl/casl-ability.factory';
import { BaseController } from 'src/common/shared/base-controller';
import { ClientQueryDto } from 'src/common/shared/dtos/client-query.dto';
import { IdsDto } from 'src/common/shared/dtos/ids.dto';
import { ACCESS_TOKEN_KEY } from 'src/common/utils/constants/app.constant';
import { PoliciesGuard } from 'src/guards/policies.guard';
import { CheckPolicies } from '../../../guards/policies.guard';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User, UserDocument } from '../schemas/user.schema';
import { UsersService } from '../users.service';

@ApiTags('users')
@Controller('users')
export class UsersController extends BaseController<User, UserDocument> {
    constructor(private readonly usersService: UsersService) {
        super(usersService);
    }
    // FETCHES
    @Get()
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('read', 'User'))
    protected async fetchAll(@Query() query: ClientQueryDto): Promise<User[]> {
        return super.findAll(query);
    }
    //
    @Get('count')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('read', 'User'))
    @UsePipes(new ValidationPipe({ transform: true }))
    async count(@Query() query: ClientQueryDto): Promise<number> {
        return super.count(query);
    }
    //
    @Get(':id')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('read', 'User'))
    async fetchById(@Param('id') id: string): Promise<User> {
        return super.findById(id);
    }
    // CREATE
    @Post()
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('create', 'User'))
    create(@Body() data: CreateUserDto) {
        return this.usersService.create(data);
    }
    // UPDATE
    @Patch('deactivate/:id')
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @CheckPolicies((ability: AppAbility) => ability.can('update', 'User'))
    async deactivate(@Param('id') id: string): Promise<User> {
        const item = await this.usersService.updateById(id, {
            status: 'inactive',
        });
        if (item) {
            return item;
        }
        throw new BadRequestException();
    }

    @Patch('reactivate/:id')
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @CheckPolicies((ability: AppAbility) => ability.can('update', 'User'))
    async reactivate(@Param('id') id: string): Promise<User> {
        const item = await this.usersService.updateById(id, {
            status: 'active',
        });
        if (item) {
            return item;
        }
        throw new BadRequestException();
    }

    @Patch(':id')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('update', 'User'))
    update(@Param('id') id: string, @Body() data: UpdateUserDto) {
        return this.usersService.updateById(id, data);
    }

    // DELETE
    @Delete('records')
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @CheckPolicies((ability: AppAbility) => ability.can('delete', 'User'))
    async deleteRecords(@Query() ids: IdsDto): Promise<User[]> {
        return super.deleteMany(ids);
    }
    //
    @Delete(':id')
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @CheckPolicies((ability: AppAbility) => ability.can('delete', 'User'))
    async deleteRecord(@Param('id') id: string): Promise<User> {
        return super.deleteOne(id);
    }
}
