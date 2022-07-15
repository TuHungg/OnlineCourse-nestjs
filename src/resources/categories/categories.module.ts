import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryAsyncModelFactory } from './schemas/category.schema';
import { SharedModule } from 'src/common/shared/shared.module';
import { CaslModule } from 'src/casl/casl.module';

@Module({
    imports: [
        MongooseModule.forFeatureAsync([CategoryAsyncModelFactory]),
        SharedModule,
        CaslModule,
    ],
    controllers: [CategoriesController],
    providers: [CategoriesService],
    exports: [CategoriesService],
})
export class CategoriesModule {}
