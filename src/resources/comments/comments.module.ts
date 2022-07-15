import { NotificationsModule } from './../notifications/notifications.module';
import { CaslModule } from './../../casl/casl.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from 'src/common/shared/shared.module';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CommentAsyncModelFactory } from './schemas/comment.schema';

@Module({
    imports: [
        MongooseModule.forFeatureAsync([CommentAsyncModelFactory]),
        SharedModule,
        CaslModule,
        NotificationsModule,
    ],
    controllers: [CommentsController],
    providers: [CommentsService],
    exports: [CommentsService],
})
export class CommentsModule {}
