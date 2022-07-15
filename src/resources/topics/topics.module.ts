import { CaslModule } from './../../casl/casl.module';
import { Module } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { TopicsController } from './topics.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Topic, TopicSchema } from './schemas/topic.schema';
import { SharedModule } from 'src/common/shared/shared.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Topic.name,
                schema: TopicSchema,
            },
        ]),
        SharedModule,
        CaslModule,
    ],
    controllers: [TopicsController],
    providers: [TopicsService],
    exports: [TopicsService],
})
export class TopicsModule {}
