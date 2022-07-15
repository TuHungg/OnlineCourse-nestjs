import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import dummy_sliders from 'src/common/dummy_data/dummy_sliders';
import { BaseModel, IEmbedOption } from 'src/common/shared/base-model';
import { FetchOptionsDto } from 'src/common/shared/dtos/fetch-options.dto';
import IStandardizedClientQuery from 'src/common/shared/interfaces/standardized-client-query.interface';
import { Slider, SliderDocument } from './schemas/slider.schema';

@Injectable()
export class SlidersService extends BaseModel<Slider, SliderDocument> {
    protected searchFields: string[] = ['name', 'description'];
    protected basicEmbedOptions: IEmbedOption[] = [];
    protected detailEmbedOptions: IEmbedOption[] = [];
    protected displayFields: string[] = [
        '_id',
        'name',
        'status',
        'description',
        'picture',
        'history',
    ];
    protected fileFields: string[] = ['picture'];

    get dummyData(): any[] {
        return dummy_sliders;
    }

    constructor(@InjectModel(Slider.name) private readonly sliderModel: Model<SliderDocument>) {
        super('sliders', sliderModel);
    }
    private getHomeItemsPipeline(query?: FetchOptionsDto) {
        const standardQuery: IStandardizedClientQuery<Slider> = {
            limit: query?._limit,
            skip: BaseModel.getSkipValue(query?._page, query?._limit),
            filter: {
                status: 'active',
            },
            sort: {
                'history.createdAt': -1,
            },
        };
        return super.getPipelineStagesByClientQuery(standardQuery, undefined);
    }

    getHomeItems(query: FetchOptionsDto) {
        const { allStages } = this.getHomeItemsPipeline(query);
        return this.model.aggregate(allStages);
    }

    async countHomeItems() {
        const { nonePaginationStages } = this.getHomeItemsPipeline();
        const result = await this.model.aggregate([
            ...nonePaginationStages,
            {
                $count: 'n',
            },
        ]);
        return super.handleCountResult(result);
    }
}
