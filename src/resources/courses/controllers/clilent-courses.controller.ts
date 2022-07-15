import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClientQueryDto } from 'src/common/shared/dtos/client-query.dto';
import { FetchOptionsDto } from 'src/common/shared/dtos/fetch-options.dto';
import ClientCoursesService from '../services/client-courses.service';

@ApiTags('course apis for client')
@Controller('courses/client')
export class CoursesClientController {
    constructor(private readonly clientCoursesService: ClientCoursesService) {}

    @Get('/slug/:slug')
    fetchBySlug(@Param('slug') slug: string) {
        return this.clientCoursesService.fetchBySlug(slug);
    }

    // API FOR HOME PAGE
    @Get('/latest-items')
    getLatestItems(@Query() query: FetchOptionsDto) {
        return this.clientCoursesService.getLatestItems(query);
    }
    @Get('/count-latest-items')
    countLatestItems() {
        return this.clientCoursesService.countLatestItems();
    }
    //
    @Get('/most-popular-items')
    getMostPopularItems(@Query() query: FetchOptionsDto) {
        return this.clientCoursesService.getMostPopularItems(query);
    }
    @Get('/count-most-popular-items')
    countMostPopularItems() {
        return this.clientCoursesService.countMostPopularItems();
    }
    @Get('/highest-rating-items')
    getHighestRatingItems(@Query() query: FetchOptionsDto) {
        return this.clientCoursesService.getHighestRatingItems(query);
    }
    @Get('/count-highest-rating-items')
    countHighestRatingItems() {
        return this.clientCoursesService.countHighestRatingItems();
    }
    @Get('/count-client-filter/:fields')
    async countClientFilter(@Param('fields') fields: string, @Query() query: ClientQueryDto) {
        const fieldArr: string[] = fields.split(',').filter((val) => val.trim() != '');
        if (fieldArr.length > 0) {
            return this.clientCoursesService.countClientFilter(query, fieldArr);
        }
    }
    @Get('/client')
    async getClientItems(@Query() query: ClientQueryDto) {
        return this.clientCoursesService.fetchClientItems(query);
    }
    @Get('/count-client')
    async countClientItems(@Query() query: ClientQueryDto) {
        return this.clientCoursesService.countClientItems(query);
    }
}
