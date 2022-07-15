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
import { ISelectItem } from 'src/common/shared/interfaces/select-item.interface';
import { ACCESS_TOKEN_KEY } from 'src/common/utils/constants/app.constant';
import { CheckPolicies, PoliciesGuard } from 'src/guards/policies.guard';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';
import { Role, RoleDocument } from './schemas/role.schema';

@ApiTags('roles')
@Controller('roles')
export class RolesController extends BaseController<Role, RoleDocument> {
    constructor(private readonly rolesService: RolesService) {
        super(rolesService);
    }
    // FETCHES
    @Get()
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('read', 'Role'))
    protected async fetchAll(@Query() query: ClientQueryDto): Promise<Role[]> {
        return super.findAll(query);
    }
    @Get('validate-deletion/:id')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('delete', 'Role'))
    async validateDeletion(@Param('id') id) {
        const vldResult = await this.vldDeletion(id);
        if (!!vldResult) {
            throw new BadRequestException(vldResult);
        }
        return true;
    }
    //
    @Get('select-data')
    async fetchSelectData(): Promise<ISelectItem[]> {
        return this.rolesService.getSelectData();
    }
    //
    @Get('count')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('read', 'Role'))
    @UsePipes(new ValidationPipe({ transform: true }))
    async count(@Query() query: ClientQueryDto): Promise<number> {
        return super.count(query);
    }
    //
    @Get(':id')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('read', 'Role'))
    async fetchById(@Param('id') id: string): Promise<Role> {
        return super.findById(id);
    }
    // CREATE
    @Post()
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('create', 'Role'))
    create(@Body() createRoleDto: CreateRoleDto) {
        return this.rolesService.create(createRoleDto);
    }
    // UPDATE
    @Patch(':id')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('update', 'Role'))
    update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
        return this.rolesService.updateById(id, updateRoleDto);
    }
    // DELETE
    // @Delete('records')
    // @UseGuards(JwtAuthGuard, PoliciesGuard)
    // @ApiBearerAuth(ACCESS_TOKEN_KEY)
    // @CheckPolicies((ability: AppAbility) => ability.can('delete', 'Role'))
    // async deleteRecords(@Query() ids: IdsDto): Promise<Role[]> {
    //     return super.deleteMany(ids);
    // }
    //
    @Delete(':id')
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @CheckPolicies((ability: AppAbility) => ability.can('delete', 'Role'))
    async deleteRecord(@Param('id') id: string): Promise<Role> {
        const vldResult = await this.vldDeletion(id);
        if (!vldResult) return super.deleteOne(id);
        throw new BadRequestException(vldResult);
    }

    private vldDeletion(id: string) {
        return this.rolesService.validateDeletion(id, 'users', 'role');
    }
}
