import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import dummy_comments from 'src/common/dummy_data/dummy_comments';
import { BaseModel, IEmbedOption } from 'src/common/shared/base-model';
import { ClientQueryDto } from 'src/common/shared/dtos/client-query.dto';
import IStandardizedClientQuery from 'src/common/shared/interfaces/standardized-client-query.interface';
import Helper from 'src/common/utils/helpers/helper.helper';
import { Comment, CommentDocument } from './schemas/comment.schema';

@Injectable()
export class CommentsService extends BaseModel<Comment, CommentDocument> {
    protected displayFields: string[] = ['_id', 'content', 'user', 'timestamps'];
    //
    protected basicEmbedOptions: IEmbedOption[] = [
        {
            path: 'user',
            collection: 'users',
        },
    ];
    //
    get dummyData(): any[] {
        return dummy_comments;
    }
    constructor(
        @InjectModel(Comment.name)
        protected commentModel: Model<CommentDocument>
    ) {
        super('comments', commentModel);
    }

    private getUnitCommentsPipelines(courseId: string, unitId: string, query: ClientQueryDto) {
        const standardQuery = super.cvtStandardizedQuery(query);
        standardQuery.sort = {
            'timestamps.createdAt': -1,
        };
        standardQuery.filter = {
            ...standardQuery.filter,
            course: Helper.cvtObjectId(courseId),
            unit: Helper.cvtObjectId(unitId),
            parent: null,
        };
        return super.getPipelineStagesByClientQuery(standardQuery);
    }

    fetchUnitComments(courseId: string, unitId: string, query: ClientQueryDto) {
        const { project } = this.getDisplayStages();
        const { nonePaginationStages, paginationStages } = this.getUnitCommentsPipelines(
            courseId,
            unitId,
            query
        );
        const stages = nonePaginationStages.concat(
            [
                {
                    $lookup: {
                        from: 'comments',
                        as: 'subs',
                        let: { parentId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$parent', '$$parentId'],
                                    },
                                },
                            },
                            {
                                $limit: 1,
                            },
                        ],
                    },
                },
                {
                    $project: {
                        ...project,
                        hasSub: {
                            $cond: [{ $gt: [{ $size: '$subs' }, 0] }, true, false],
                        },
                    },
                },
            ],
            paginationStages
        );
        return this.commentModel.aggregate(stages);
    }

    fetchUnitSubComments(courseId: string, unitId: string, parentId: string) {
        const standardQuery: IStandardizedClientQuery<Comment> = {
            skip: BaseModel.getSkipValue(1, 1000),
            limit: 1000,
            filter: {
                course: Helper.cvtObjectId(courseId),
                unit: Helper.cvtObjectId(unitId),
                parent: Helper.cvtObjectId(parentId),
            },
            sort: {
                'timestamps.createdAt': 1,
            },
        };
        return this.commentModel.aggregate([
            ...super.getLookup({
                from: 'users',
                localField: 'user',
            }),
            {
                $match: standardQuery.filter,
            },
            {
                $skip: standardQuery.skip,
            },
            {
                $limit: standardQuery.limit,
            },
            {
                $sort: standardQuery.sort,
            },
        ]);
    }

    async countCourseReviews(courseId: string, unitId: string, query: ClientQueryDto) {
        const { nonePaginationStages } = this.getUnitCommentsPipelines(courseId, unitId, query);
        const result = await this.model.aggregate([
            ...nonePaginationStages,
            {
                $count: 'n',
            },
        ]);
        return super.handleCountResult(result);
    }

    async countUnitComments(courseId: string, unitId: string, query: ClientQueryDto) {
        const { nonePaginationStages } = this.getUnitCommentsPipelines(courseId, unitId, query);
        const result = await this.model.aggregate([
            ...nonePaginationStages,
            {
                $count: 'n',
            },
        ]);
        return super.handleCountResult(result);
    }
}
