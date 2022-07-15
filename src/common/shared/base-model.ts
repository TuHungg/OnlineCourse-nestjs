/* eslint-disable prefer-const */
import lodash from 'lodash';
import { FilterQuery, Model, PipelineStage, PopulateOptions } from 'mongoose';
import IStandardizedClientQuery from 'src/common/shared/interfaces/standardized-client-query.interface';
import FileUploadHelper from '../utils/helpers/file-upload.helper';
import Helper from '../utils/helpers/helper.helper';
import { ClientQueryDto } from './dtos/client-query.dto';
import IConflictData from './interfaces/conflict-data.interface';
import IFindOptions from './interfaces/find-options';
import { ISelectItem } from './interfaces/select-item.interface';
import { TController } from './types/shared.type';

export interface IEmbedOption extends PopulateOptions {
    path: string;
    collection?: TController;
    populate?: IEmbedOption[] | IEmbedOption;
}

export abstract class BaseModel<E, D> {
    protected collection: TController;
    // FOR SELECT DATA PROJECT
    protected selectDataLabelField = 'name';
    // FOR PROJECT DATA
    protected displayFields: string[] = ['_id'];
    // FOR LOOKUP DATA
    protected basicEmbedOptions: IEmbedOption[] = [];
    protected detailEmbedOptions: IEmbedOption[] = [];
    // FOR SEARCH ALL
    protected searchFields: string[] = [];
    // FOR OPTIMIZE STORAGE IF DOC DELETED
    protected fileFields: string[] = [];

    abstract get dummyData(): any[];

    constructor(collection: TController, public model: Model<D>) {
        this.collection = collection;
    }

    // RESET
    async reset(): Promise<D[]> {
        const items = await this.model.find();
        const deletePros: Promise<any>[] = [];
        items.forEach((item) => {
            deletePros.push(item.delete());
        });
        await Promise.all(deletePros);
        await this.model.insertMany(this.dummyData);
        return this.model.find();
    }

    async findAll(query: ClientQueryDto | IStandardizedClientQuery<E>): Promise<D[]> {
        const pipelines = this.getPipelineStagesByClientQuery(
            this.cvtStandardizedQuery(query)
        ).allStages;
        return this.model.aggregate(pipelines);
    }

    async count(query: ClientQueryDto): Promise<number> {
        const pipelineStages: PipelineStage[] = [
            ...this.getPipelineStagesByClientQuery(this.standardizeClientQuery(query))
                .nonePaginationStages,
            {
                $count: 'n',
            },
        ];
        let result = await this.model.aggregate(pipelineStages).exec();
        return this.handleCountResult(result);
    }

    // ADMIN
    async adminFindAll(query: ClientQueryDto | IStandardizedClientQuery<E>): Promise<D[]> {
        query = this.cvtStandardizedQuery(query);
        // Helper.deepLog(query, '\nstandardized');
        const { allStages } = this.getPipelineStagesByClientQuery(query);
        return this.model.aggregate(allStages);
    }

    async getSelectData(query: ClientQueryDto): Promise<ISelectItem[]> {
        const { sort, limit } = this.cvtStandardizedQuery(query);
        const sortStage = Object.keys(sort).length > 0 ? [{ $sort: sort }] : [];
        return this.model.aggregate([
            ...sortStage,
            {
                $limit: limit,
            },
            {
                $project: this.selectDataProject,
            },
        ]);
    }

    protected get selectDataProject() {
        return {
            _id: 0,
            value: '$_id',
            label: `$${this.selectDataLabelField}`,
        };
    }

    // ADDITION HELPER METHODS =======
    protected getPipelineStagesByClientQuery(
        query: IStandardizedClientQuery<E>,
        exclude?: string[],
        options?: IFindOptions
    ): {
        allStages: PipelineStage[];
        nonePaginationStages: PipelineStage[];
        paginationStages: PipelineStage[];
    } {
        options = this.getFindOptions(options);
        const { skip, limit, filter, sort } = query;

        // lookups
        const lookups: PipelineStage[] = this.getEmbedLookups(this.getEmbedOptions(options));

        // match
        const matchStage =
            Object.keys(filter).length > 0
                ? [
                      {
                          $match: { ...filter },
                      },
                  ]
                : [];

        // match
        let sortStage = [];
        if (lookups.length > 0 && !!sort) {
            sortStage =
                Object.keys(sort).length > 0
                    ? [
                          {
                              $sort: { ...sort, _id: -1 },
                          },
                      ]
                    : [];
        } else {
            sortStage = [{ $sort: { ...sort, _id: -1 } }];
        }
        let mergeSort = sortStage;

        // merge
        let { group, project } = this.getDisplayStages();
        if (options.project) project = options.project;
        const mergeStages = [{ $group: group }, ...mergeSort, { $project: project }];

        let nonePaginationStages: PipelineStage[] = [
            ...lookups,
            ...matchStage,
            ...sortStage,
            ...mergeStages,
        ];

        // search
        if (!!query.search) {
            if (
                query.search?._searchField == 'all' ||
                this.processSearchFields.includes(query.search?._searchField)
            ) {
                nonePaginationStages = [...this.preprocessSearchStages, ...nonePaginationStages];
            }
        }

        // handle exclude stages
        nonePaginationStages = nonePaginationStages.filter(
            (item) => !exclude?.includes(Object.keys(item)[0])
        );

        // paginate
        const paginationStages: PipelineStage[] = [{ $skip: skip }, { $limit: limit }];
        //

        const allStages = nonePaginationStages.concat(paginationStages);
        return { allStages, nonePaginationStages, paginationStages };
    }

    protected standardizeClientQuery(query: ClientQueryDto): IStandardizedClientQuery<E> {
        let {
            _page: page = 1,
            _sortBy: sortBy = [],
            _order: order = [],
            _limit: limit = 100,
            _searchField,
            _searchValue,
        } = query;

        // sort
        sortBy = !Array.isArray(sortBy) ? [sortBy] : sortBy;
        order = !Array.isArray(order) ? [order] : order;

        const sort: any = {};
        sortBy.forEach((val, index) => {
            if (!!val) sort[val] = order[index] == 'desc' ? -1 : 1;
        });
        if (Object.keys(sort).length == 0) sort._id = 1;
        let filter = this.getFilterExpression(query);

        // search
        let search;
        if (!!_searchField && !!_searchValue) {
            search = { _searchField, _searchValue };
            if (_searchField == 'all') {
                filter = {
                    ...filter,
                    ...this.getSearchAllFilter(_searchValue),
                };
            } else {
                if (_searchField == '_id') {
                    if (Helper.isObjectId(_searchValue))
                        filter._id = Helper.cvtObjectId(_searchValue);
                } else {
                    filter[_searchField] = this.getSearchPattern(_searchValue);
                }
            }
        }
        const skip = BaseModel.getSkipValue(page, limit);
        const result = { page, limit, filter, sort, search, skip };
        return result;
    }

    static getSkipValue(page?: number, limit?: number) {
        page = page || 0;
        limit = limit || 100;
        return page > 0 ? (page - 1) * limit : 0;
    }

    getFilterExpression(query: ClientQueryDto) {
        const filterArr = [];
        for (const key in query) {
            const field = key.slice(0, key.indexOf('_filter'));
            if (key.match(/^\$/)) {
                filterArr.push(query[key]);
            } else if (key.match(/_filter_$/) && !!query[key]) {
                filterArr.push({
                    [field]: query[key],
                });
            } else if (key.match(/_filter$/) && !!query[key]) {
                let valueArr: any[];
                if (typeof query[key] == 'string') {
                    valueArr = query[key].split(',');
                    valueArr = valueArr
                        .filter((val) => val.trim() != '')
                        .map((val) => {
                            if (Helper.isObjectId(val)) {
                                return Helper.cvtObjectId(val);
                            }
                            return val;
                        });
                } else {
                    valueArr = [query[key]];
                }
                const filterExpression =
                    valueArr.length > 0
                        ? {
                              [field]: {
                                  $in: valueArr,
                              },
                          }
                        : valueArr[0];

                filterArr.push(filterExpression);
            }
        }
        if (filterArr.length > 1) {
            return { $and: filterArr };
        }
        if (filterArr.length == 1) return filterArr[0];
        return {};
    }
    // CHECK
    async checkUnique(field: string, value: string): Promise<boolean> {
        const item = await this.findOne({ [field]: value } as any);
        return !!item;
    }

    // ADDITION DB METHODS ======
    async findById(id: string): Promise<D | null> {
        const populates = this.getPopulates({ lookupMode: 'detail' });
        if (populates) {
            return this.model.findById(id).populate(populates);
        }
        return this.model.findById(id);
    }

    async updateById(id: string, data: any) {
        await this.model
            .findById(id)
            .exec()
            .then((item) => {
                this.fileFields.forEach((field) => {
                    const currentUrl = Helper.pickObjValue(data, field);
                    if (typeof currentUrl != 'undefined') {
                        const oldUrl = Helper.pickObjValue(item, field);
                        if (!!oldUrl) {
                            if (oldUrl == null || oldUrl != currentUrl) {
                                this.deleteFileByUrl(oldUrl);
                            }
                        }
                    }
                });
            });
        const payload = this.attachHistoryData(data, 'update');
        const dotData = Helper.cvtDotObj(payload);
        // Helper.deepLog(dotData, id, 'update payload');
        return this.findOneAndUpdate({ _id: id }, dotData);
    }

    async deleteById(id: string): Promise<D> {
        const item = await this.model.findById(id);
        this.deleteFilesRelatedToDoc(item);
        return item.delete();
    }

    async deleteByIds(ids: string[]): Promise<D[]> {
        const promises: Promise<D>[] = [];
        ids.forEach((id) => {
            const p = this.deleteById(id);
            promises.push(p);
        });
        return Promise.all(promises);
    }

    //
    async create(data: any): Promise<D> {
        const payload = this.attachHistoryData(data, 'create');
        return new this.model(payload).save() as any;
    }

    async findOne(filter: FilterQuery<D>): Promise<D | null> {
        return this.model.findOne(filter).exec();
    }

    async deleteFields(filter: FilterQuery<D>, fields: string[]): Promise<boolean> {
        const unsetObj = {};
        fields.forEach((field) => {
            unsetObj[field] = '';
        });
        return (
            (
                await this.model.updateOne(filter, {
                    $unset: unsetObj,
                })
            ).modifiedCount > 0
        );
    }

    protected async find(filter: FilterQuery<D>): Promise<D[]> {
        return this.model.find(filter).exec();
    }

    protected async findOneAndUpdate(filter: FilterQuery<E>, item: Partial<E>): Promise<D | null> {
        return this.model.findOneAndUpdate(filter, item, {
            new: true,
        });
    }

    protected async findOneAndDelete(filter: FilterQuery<D | null>) {
        return this.model.findOneAndDelete(filter);
    }

    // HELPER METHODS
    protected getDisplayStages(): { project: object; group: object } {
        const project = {};
        const group = {};
        this.displayFields.forEach((field) => {
            if (field != '_id') {
                group[field] = { $first: `$${field}` };
            } else {
                group[field] = `$${field}`;
            }
            project[field] = 1;
        });

        this.mergeFields?.forEach((field) => {
            group[field] = { $push: `$${field}` };
        });
        return { project, group };
    }

    // protected extractEmbedFields(fields: string[]): string[] {
    //     const result: string[] = [];
    //     for (const field of fields) {
    //         const firstLevel = field.split('.')[0];
    //         if (this.embedOptions.includes(firstLevel)) {
    //             result.push(firstLevel);
    //         }
    //     }
    //     return result;
    // }

    protected getEmbedLookups(embedOptions: IEmbedOption[]) {
        let result = [];
        embedOptions.forEach((option) => {
            const arr: any = [
                {
                    $lookup: {
                        from: option.collection || this.getCollectionName(option.path),
                        localField: option.path,
                        foreignField: '_id',
                        as: option.path,
                    },
                },
                {
                    $unwind: {
                        path: `$${option.path}`,
                        preserveNullAndEmptyArrays: true,
                    },
                },
            ];
            if (Helper.isPlural(option.path)) {
                arr.unshift({
                    $unwind: {
                        path: `$${option.path}`,
                        preserveNullAndEmptyArrays: true,
                    },
                });
            }
            result = result.concat(arr);
        });
        return result;
    }

    protected getSearchPattern(val: string) {
        const reverse = val.split(' ').reverse().join(' ');
        return new RegExp(`${val}|${reverse}`, 'ism');
    }

    protected getCollectionName(string: string) {
        if (string) {
            return Helper.toPlural(string);
        }
        return string;
    }

    protected cvtStandardizedQuery(
        query: ClientQueryDto | IStandardizedClientQuery<E>
    ): IStandardizedClientQuery<E> {
        return query instanceof ClientQueryDto ? this.standardizeClientQuery(query) : query;
    }

    protected getSearchAllFilter(val: string) {
        if (this.searchFields.length > 0) {
            const orStage = this.searchFields
                .map((field) => {
                    if (field == '_id') {
                        if (Helper.isObjectId(val))
                            return {
                                _id: Helper.cvtObjectId(val),
                            };
                        return null;
                    } else {
                        return {
                            [field]: this.getSearchPattern(val),
                        };
                    }
                })
                .filter((item) => !!item);
            return {
                $or: orStage,
            };
        }
        return {};
    }

    protected get preprocessSearchStages(): any[] {
        return [];
    }

    protected get processSearchFields(): string[] {
        return this.searchFields.filter((field) => {
            return field.charAt(field.length - 1) == '_';
        });
    }

    protected get mergeFields(): string[] {
        return this.basicEmbedOptions
            .filter((item) => Helper.isPlural(item.path))
            .map((item) => item.path);
    }

    protected getPopulates(options?: IFindOptions): PopulateOptions[] {
        const populates: PopulateOptions[] = this.getEmbedOptions(options).map((item) => {
            const { collection, ...rest } = item;
            return { ...rest };
        });
        return populates;
    }

    //FILE
    protected deleteFilesRelatedToDoc(item: D) {
        this.fileFields.forEach((field) => {
            const url: string = Helper.pickObjValue(item as any, field);
            if (url) {
                this.deleteFileByUrl(url);
            }
        });
    }

    protected deleteFileByUrl(url: string) {
        FileUploadHelper.deleteByDownloadUrl(url)
            .then(() => {
                console.info('file deleted', url);
            })
            .catch((e) => {
                console.error('failed to delete file', url, e);
            });
    }

    protected get defaultFindOptions(): IFindOptions {
        return {
            lookupMode: 'basic',
        };
    }

    protected getEmbedOptions(options: IFindOptions) {
        switch (options.lookupMode) {
            case 'basic':
                return this.basicEmbedOptions;
            case 'detail':
                if (this.detailEmbedOptions.length > 0) return this.detailEmbedOptions;
                else return this.basicEmbedOptions;
        }
    }

    protected getFindOptions(options?: IFindOptions): IFindOptions {
        return { ...this.defaultFindOptions, ...options };
    }

    getModel() {
        return this.model;
    }

    all() {
        return this.model.find();
    }

    handleCountResult(result: any): number {
        return result[0]?.n || 0;
    }

    getLookup(data: {
        from: TController;
        foreignField?: string;
        localField: string;
        project?: any;
        as?: string;
        lookupOne?: boolean;
    }) {
        const {
            from,
            localField,
            foreignField = '_id',
            project,
            as = localField,
            lookupOne = true,
        } = data;
        let stages = [];
        const variableName = localField.replace(/(\.|_)/, '');
        if (typeof project != 'undefined') {
            stages = stages.concat([
                {
                    $lookup: {
                        from,
                        let: {
                            [variableName]: `$${localField}`,
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: [`$$${variableName}`, `$${foreignField}`],
                                    },
                                },
                            },
                            {
                                $project: project,
                            },
                        ],
                        as,
                    },
                },
            ]);
        } else {
            stages = stages.concat([
                {
                    $lookup: {
                        from,
                        localField,
                        foreignField,
                        as,
                    },
                },
            ]);
        }
        if (lookupOne) {
            stages = stages.concat([
                {
                    $unwind: {
                        path: `$${as}`,
                        preserveNullAndEmptyArrays: true,
                    },
                },
            ]);
        }
        return stages;
    }

    protected getSelectDataProject(labelField = 'label') {
        return {
            _id: 0,
            value: '$_id',
            label: '$name',
        };
    }

    public attachHistoryData(data: any, action: 'update' | 'create', userId?: string, date?: Date) {
        const dateStr = date ? date.toISOString() : new Date().toISOString();
        switch (action) {
            case 'update':
                lodash.set(data, 'updatedAt', dateStr);
                lodash.set(data, 'history.updatedAt', dateStr);
                lodash.set(data, 'timestamps.updatedAt', dateStr);
                if (!!userId) {
                    lodash.set(data, 'updatedBy', userId);
                    lodash.set(data, 'history.updatedBy', userId);
                }
                break;
            case 'create':
                !data.timestamp && lodash.set(data, 'timestamp', dateStr);
                !data.createdAt && lodash.set(data, 'createdAt', dateStr);
                !data.history?.createdAt && lodash.set(data, 'history.createdAt', dateStr);
                !data.timestamps?.createdAt && lodash.set(data, 'timestamps.createdAt', dateStr);
                if (!!userId) {
                    lodash.set(data, 'createdBy', userId);
                    lodash.set(data, 'history.createdBy', userId);
                }
                break;
        }
        return data;
    }

    async validateDeletion(
        id: string,
        from: TController,
        foreignField: string
    ): Promise<null | IConflictData> {
        const pipeline = [
            {
                $match: {
                    _id: Helper.cvtObjectId(id),
                },
            },
            ...this.getLookup({
                from,
                foreignField,
                localField: '_id',
                // project: {
                //     _id: 1,
                // },
                as: 'items',
                lookupOne: false,
            }),
            {
                $project: {
                    n: {
                        $size: '$items',
                    },
                },
            },
        ];
        const countResult = await this.model.aggregate(pipeline);
        const result = this.handleCountResult(countResult);
        if (result > 0) {
            // conflict
            return {
                reference: {
                    type: from,
                    amount: result,
                },
            };
        }
        return null;
    }
}
