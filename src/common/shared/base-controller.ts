import { BadRequestException, Get, NotFoundException, Param } from '@nestjs/common';
import Helper from '../utils/helpers/helper.helper';
import { BaseModel } from './base-model';
import { ClientQueryDto } from './dtos/client-query.dto';
import { IdsDto } from './dtos/ids.dto';

export abstract class BaseController<E, D> {
    constructor(private mainService: BaseModel<E, D>) {}

    @Get('check-unique/:field/:value')
    async checkUnique(
        @Param('field') field: string,
        @Param('value') value: string
    ): Promise<boolean> {
        return this.mainService.checkUnique(field, value);
    }

    // DEV
    @Get('dev/reset')
    async reset(): Promise<D[]> {
        return this.mainService.reset();
    }

    @Get('dev/all')
    async all(): Promise<D[]> {
        return this.mainService.all();
    }

    //
    protected async count(query: ClientQueryDto): Promise<number> {
        return this.mainService.count(query);
    }

    protected async findAll(query: ClientQueryDto): Promise<D[]> {
        switch (query._context) {
            case 'admin':
                return this.mainService.adminFindAll(query);
            default:
                return this.mainService.findAll(query);
        }
    }

    protected async findById(id: string): Promise<D> {
        const item: D = await this.mainService.findById(id);
        if (item) {
            return item;
        }
        throw new NotFoundException();
    }

    protected async deleteMany(ids: IdsDto): Promise<D[]> {
        const idArr = ids.ids.split(',');
        if (idArr.length > 0 && Helper.isObjectIds(idArr)) {
            return this.mainService.deleteByIds(idArr);
        }
        throw new BadRequestException();
    }

    async deleteOne(id: string): Promise<D> {
        const item: D = await this.mainService.deleteById(id);
        if (item) {
            return item;
        }
        throw new BadRequestException();
    }
}
