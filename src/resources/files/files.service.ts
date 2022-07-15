import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import dummy_files from 'src/common/dummy_data/dummy_files';
import { BaseModel } from 'src/common/shared/base-model';
import { FileQueryDto } from 'src/common/shared/dtos/file-query.dto';
import FileUploadHelper from 'src/common/utils/helpers/file-upload.helper';
import Helper from 'src/common/utils/helpers/helper.helper';
import { File, FileDocument } from './schemas/file.schema';

@Injectable()
export class FilesService extends BaseModel<File, FileDocument> {
    protected fileFields: string[] = ['url', 'thumbnailUrl'];
    get dummyData(): any[] {
        return dummy_files;
    }

    async reset(): Promise<FileDocument[]> {
        const dummyFileIds = this.dummyData.map((item) => item._id);
        const items = await this.model.find({
            _id: {
                $nin: dummyFileIds,
            },
        });
        const deletePros: Promise<any>[] = [];
        items.forEach((item) => {
            deletePros.push(item.delete());
        });
        await Promise.all(deletePros);
        return this.model.find();
    }

    constructor(@InjectModel(File.name) protected fileModel: Model<FileDocument>) {
        super('files', fileModel);
    }

    private getUserFilesByIdFilter(userId: string, query: FileQueryDto): FilterQuery<File> {
        const searchFilter: any = {};
        const fileTypeFilter: any = {};
        const { search, fileType } = query;
        if (search) {
            const searchPattern = this.getSearchPattern(search);
            searchFilter.name = searchPattern;
        }
        if (fileType != 'all') {
            fileTypeFilter.type = this.getSearchPattern(fileType);
        }
        return {
            ...fileTypeFilter,
            ...searchFilter,
            'history.createdBy': Helper.cvtObjectId(userId),
        };
    }

    getUserFilesById(userId: string, query: FileQueryDto): Promise<FileDocument[]> {
        const items = this.fileModel
            .find(this.getUserFilesByIdFilter(userId, query))
            .sort({ 'history.createdAt': -1 })
            .skip(BaseModel.getSkipValue(query._page, query._limit))
            .limit(query._limit)
            .exec();
        return items;
    }
    countUserFilesById(userId: string, query: FileQueryDto): Promise<number> {
        const items = this.fileModel
            .find(this.getUserFilesByIdFilter(userId, query))
            .count()
            .exec();
        return items;
    }
    async parseVideo(url: string) {
        const metadata = await FileUploadHelper.parseVideo(url);
        return metadata;
    }
}
