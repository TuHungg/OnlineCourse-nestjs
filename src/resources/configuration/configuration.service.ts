import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import dummy_configuration from 'src/common/dummy_data/dummy_configuration';
import Helper from 'src/common/utils/helpers/helper.helper';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';
import { Configuration, ConfigurationDocument } from './schemas/configuration.schema';

@Injectable()
export class ConfigurationService {
    constructor(
        @InjectModel(Configuration.name)
        private readonly configurationModel: Model<ConfigurationDocument>
    ) {}

    async reset() {
        await this.configurationModel.deleteMany();
        return this.configurationModel.insertMany(dummy_configuration);
    }

    fetch() {
        return this.configurationModel.findOne().lean().exec();
    }

    update(data: UpdateConfigurationDto) {
        const dotData = Helper.cvtDotObj(data);
        return this.configurationModel.findOneAndUpdate({}, dotData, { new: true });
    }
}
