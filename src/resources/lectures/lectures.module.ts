import { CaslModule } from './../../casl/casl.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from './../../common/shared/shared.module';
import { FilesModule } from './../files/files.module';
import { LecturesController } from './lectures.controller';
import { LecturesService } from './lectures.service';
import { Lecture, LectureSchema } from './schemas/lecture.schema';

@Module({
    imports: [
        FilesModule,
        MongooseModule.forFeature([
            {
                name: Lecture.name,
                schema: LectureSchema,
            },
        ]),
        SharedModule,
        CaslModule,
    ],
    controllers: [LecturesController],
    providers: [LecturesService],
    exports: [LecturesService],
})
export class LecturesModule {}
