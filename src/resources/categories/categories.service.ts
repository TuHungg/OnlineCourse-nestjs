import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import dummy_categories from 'src/common/dummy_data/dummy_categories';
import { BaseModel, IEmbedOption } from 'src/common/shared/base-model';
import { ISelectItem } from 'src/common/shared/interfaces/select-item.interface';
import Helper from 'src/common/utils/helpers/helper.helper';
import ISecondLevelCatInfo from './interfaces/second-level-cat-info.interface';
import { Category, CategoryDocument } from './schemas/category.schema';

@Injectable()
export class CategoriesService extends BaseModel<Category, CategoryDocument> {
    protected selectDataLabelField = 'name';
    // FOR PROJECT DATA
    protected displayFields: string[] = ['_id', 'name', 'slug', 'parent', 'status', 'history'];
    // FOR LOOKUP DATA
    protected basicEmbedOptions: IEmbedOption[] = [
        {
            path: 'parent',
            collection: 'categories',
        },
        {
            path: 'history.createdBy',
            collection: 'users',
        },
    ];
    protected detailEmbedOptions: IEmbedOption[] = [...this.basicEmbedOptions];
    // FOR SEARCH ALL
    protected searchFields: string[] = ['name'];
    // FOR OPTIMIZE STORAGE IF DOC DELETED
    protected fileFields: string[] = [];

    get dummyData(): any[] {
        return dummy_categories;
    }
    constructor(
        @InjectModel(Category.name)
        protected categoryModel: Model<CategoryDocument>
    ) {
        super('categories', categoryModel);
    }

    // FETCHES
    async getPrimarySelectData(): Promise<ISelectItem[]> {
        return this.categoryModel.aggregate([
            {
                $match: {
                    parent: null,
                },
            },
            {
                $sort: {
                    name: 1,
                },
            },
            {
                $project: this.selectDataProject,
            },
        ]);
    }

    async getSubSelectData(parentId: string): Promise<ISelectItem[]> {
        return this.categoryModel.aggregate([
            {
                $match: {
                    parent: Helper.cvtObjectId(parentId),
                },
            },
            {
                $sort: {
                    name: 1,
                },
            },
            {
                $project: this.selectDataProject,
            },
        ]) as any;
    }

    async fetchBySlug(slug: string): Promise<CategoryDocument> {
        const populates = this.getPopulates({ lookupMode: 'detail' });
        return this.categoryModel
            .findOne({
                ...this.clientFilter,
                slug: slug,
            })
            .populate(populates);
    }

    // CLIENT METHODS
    async geMenuData(): Promise<ISecondLevelCatInfo[]> {
        const items = await this.categoryModel.aggregate([
            {
                $match: {
                    status: 'active',
                    parent: null,
                },
            },
            {
                $lookup: {
                    from: 'categories',
                    let: {
                        parentId: '$_id',
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$parent', '$$parentId'],
                                },
                            },
                        },
                        {
                            $sort: { name: 1 },
                        },
                    ],
                    as: 'subCats',
                },
            },

            {
                $project: {
                    name: 1,
                    slug: 1,
                    subCats: {
                        $filter: {
                            input: '$subCats',
                            as: 'subCat',
                            cond: { $eq: ['$$subCat.status', 'active'] },
                        },
                    },
                },
            },
            {
                $sort: {
                    name: 1,
                },
            },
            {
                $project: {
                    name: 1,
                    slug: 1,
                    subCats: {
                        $map: {
                            input: '$subCats',
                            as: 'subCat',
                            in: {
                                name: '$$subCat.name',
                                slug: '$$subCat.slug',
                            },
                        },
                    },
                },
            },
        ]);
        return items as ISecondLevelCatInfo[];
    }

    private get clientFilter() {
        return {
            status: 'active',
        };
    }
}
