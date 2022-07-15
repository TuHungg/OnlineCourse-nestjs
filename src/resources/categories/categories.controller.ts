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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import ISecondLevelCatInfo from './interfaces/second-level-cat-info.interface';
import { Category, CategoryDocument } from './schemas/category.schema';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController extends BaseController<Category, CategoryDocument> {
    constructor(private readonly categoriesService: CategoriesService) {
        super(categoriesService);
    }

    @Get('primary-select-data')
    async getPrimarySelectData(): Promise<ISelectItem[]> {
        return this.categoriesService.getPrimarySelectData();
    }
    @Get('sub-select-data/:parentId')
    async getSubSelectData(@Param('parentId') id: string): Promise<ISelectItem[]> {
        return this.categoriesService.getSubSelectData(id);
    }
    // CLIENT APIS
    @Get('menu-data')
    async getMenuData(): Promise<ISecondLevelCatInfo[]> {
        return this.categoriesService.geMenuData();
    }

    @Get('/slug/:slug')
    fetchBySlug(@Param('slug') slug: string) {
        return this.categoriesService.fetchBySlug(slug);
    }
    // FETCHES
    @Get()
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('read', 'Category'))
    protected async fetchAll(@Query() query: ClientQueryDto): Promise<Category[]> {
        return super.findAll(query);
    }
    //
    @Get('validate-deletion/:id')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('delete', 'Category'))
    async validateDeletion(@Param('id') id) {
        const validateResult = await this.vldDeletion(id);
        if (!!validateResult) {
            throw new BadRequestException(validateResult);
        }
        return true;
    }
    //
    @Get('select-data')
    async getSelectData(@Query() query: ClientQueryDto): Promise<ISelectItem[]> {
        return this.categoriesService.getSelectData(query);
    }
    //
    @Get('count')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('read', 'Category'))
    @UsePipes(new ValidationPipe({ transform: true }))
    async count(@Query() query: ClientQueryDto): Promise<number> {
        return super.count(query);
    }
    //
    @Get(':id')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('read', 'Category'))
    async fetchById(@Param('id') id: string): Promise<Category> {
        return super.findById(id);
    }
    // CREATE
    @Post()
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('create', 'Category'))
    create(@Body() data: CreateCategoryDto) {
        return this.categoriesService.create(data);
    }
    // UPDATE
    @Patch(':id')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('update', 'Category'))
    update(@Param('id') id: string, @Body() data: UpdateCategoryDto) {
        return this.categoriesService.updateById(id, data);
    }
    // DELETE
    // @Delete('records')
    // @UseGuards(JwtAuthGuard, PoliciesGuard)
    // @ApiBearerAuth(ACCESS_TOKEN_KEY)
    // @CheckPolicies((ability: AppAbility) => ability.can('delete', 'Category'))
    // async deleteRecords(@Query() ids: IdsDto): Promise<Category[]> {
    //     return super.deleteMany(ids);
    // }
    //
    @Delete(':id')
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @CheckPolicies((ability: AppAbility) => ability.can('delete', 'Category'))
    async deleteRecord(@Param('id') id: string): Promise<Category> {
        const vldResult = await this.vldDeletion(id);
        if (!vldResult) return super.deleteOne(id);
        throw new BadRequestException(vldResult);
    }

    private vldDeletion(id: string) {
        return this.categoriesService.validateDeletion(id, 'courses', 'categories');
    }
}
