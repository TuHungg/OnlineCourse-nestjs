import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AppAbility } from 'src/casl/casl-ability.factory';
import { ACCESS_TOKEN_KEY } from 'src/common/utils/constants/app.constant';
import { CheckPolicies, PoliciesGuard } from 'src/guards/policies.guard';
import { ConfigurationService } from './configuration.service';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';

@Controller('configuration')
@ApiTags('configuration')
export class ConfigurationController {
    constructor(private readonly configurationService: ConfigurationService) {}
    //
    // @UseGuards(JwtAuthGuard, PoliciesGuard)
    // @CheckPolicies((ability: AppAbility) => ability.can('read', 'Setting'))
    @Get()
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    fetch() {
        return this.configurationService.fetch();
    }
    //
    // @UseGuards(JwtAuthGuard, PoliciesGuard)
    // @CheckPolicies((ability: AppAbility) => ability.can('read', 'Setting'))
    @Get('price-tiers')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    async fetchPriceTiers(): Promise<number[]> {
        const result = await this.configurationService.fetch();
        if (result) {
            return result.course.priceTiers;
        }
    }
    //
    @Patch()
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('update', 'Setting'))
    update(@Body() data: UpdateConfigurationDto) {
        return this.configurationService.update(data);
    }
}
