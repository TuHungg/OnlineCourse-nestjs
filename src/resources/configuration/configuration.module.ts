import { CaslModule } from './../../casl/casl.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigurationController } from './configuration.controller';
import { ConfigurationService } from './configuration.service';
import { Configuration, ConfigurationSchema } from './schemas/configuration.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Configuration.name,
                schema: ConfigurationSchema,
            },
        ]),
        CaslModule,
    ],
    providers: [ConfigurationService],
    exports: [ConfigurationService],
    controllers: [ConfigurationController],
})
export class ConfigurationModule {}
