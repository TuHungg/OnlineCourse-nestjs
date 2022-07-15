import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import dummy_topics from 'src/common/dummy_data/dummy_topics';
import { BaseModel } from 'src/common/shared/base-model';
import { Topic, TopicDocument } from './schemas/topic.schema';

@Injectable()
export class TopicsService extends BaseModel<Topic, TopicDocument> {
    get dummyData(): any[] {
        return dummy_topics;
    }

    constructor(@InjectModel(Topic.name) private readonly topicModel: Model<TopicDocument>) {
        super('topics', topicModel);
    }
}
