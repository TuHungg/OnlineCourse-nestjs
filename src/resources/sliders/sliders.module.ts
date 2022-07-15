import { CaslModule } from './../../casl/casl.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Slider, SliderSchema } from './schemas/slider.schema';
import { SlidersController } from './sliders.controller';
import { SlidersService } from './sliders.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Slider.name,
                schema: SliderSchema,
            },
        ]),
        CaslModule,
    ],
    controllers: [SlidersController],
    providers: [SlidersService],
    exports: [SlidersService],
})
export class SlidersModule {}
