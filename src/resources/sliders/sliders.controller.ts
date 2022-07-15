import {
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
import { FetchOptionsDto } from 'src/common/shared/dtos/fetch-options.dto';
import { IdsDto } from 'src/common/shared/dtos/ids.dto';
import { ACCESS_TOKEN_KEY } from 'src/common/utils/constants/app.constant';
import { CheckPolicies, PoliciesGuard } from 'src/guards/policies.guard';
import { CreateSliderDto } from './dto/create-slider.dto';
import { UpdateSliderDto } from './dto/update-slider.dto';
import { Slider, SliderDocument } from './schemas/slider.schema';
import { SlidersService } from './sliders.service';

@Controller('sliders')
@ApiTags('sliders')
export class SlidersController extends BaseController<Slider, SliderDocument> {
    constructor(private readonly slidersService: SlidersService) {
        super(slidersService);
    }
    // FETCHES
    @Get('home')
    getLatestItems(@Query() query: FetchOptionsDto) {
        return this.slidersService.getHomeItems(query);
    }
    @Get('count-home')
    countLatestItems() {
        return this.slidersService.countHomeItems();
    }
    @Get()
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('read', 'Slider'))
    protected async fetchAll(@Query() query: ClientQueryDto): Promise<Slider[]> {
        return super.findAll(query);
    }
    //
    @Get('count')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('read', 'Slider'))
    @UsePipes(new ValidationPipe({ transform: true }))
    async count(@Query() query: ClientQueryDto): Promise<number> {
        return super.count(query);
    }
    //
    @Get(':id')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('read', 'Slider'))
    async fetchById(@Param('id') id: string): Promise<Slider> {
        return super.findById(id);
    }
    // CREATE
    @Post()
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('create', 'Slider'))
    create(@Body() data: CreateSliderDto) {
        return this.slidersService.create(data);
    }
    // UPDATE
    @Patch(':id')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('update', 'Slider'))
    update(@Param('id') id: string, @Body() data: UpdateSliderDto) {
        return this.slidersService.updateById(id, data);
    }
    // DELETE
    @Delete('records')
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @CheckPolicies((ability: AppAbility) => ability.can('delete', 'Slider'))
    async deleteRecords(@Query() ids: IdsDto): Promise<Slider[]> {
        return super.deleteMany(ids);
    }
    //
    @Delete(':id')
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @CheckPolicies((ability: AppAbility) => ability.can('delete', 'Slider'))
    async deleteRecord(@Param('id') id: string): Promise<Slider> {
        return super.deleteOne(id);
    }
}
