import { UpdateFileDto } from './../files/dto/update-file.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import dummy_lectures from 'src/common/dummy_data/dummy_lectures';
import { BaseModel } from 'src/common/shared/base-model';
import FileUploadHelper from 'src/common/utils/helpers/file-upload.helper';
import { CreateFileDto } from '../files/dto/create-file.dto';
import { File, FileDocument } from '../files/schemas/file.schema';
import { FilesService } from './../files/files.service';
import { Lecture, LectureDocument } from './schemas/lecture.schema';

@Injectable()
export class LecturesService extends BaseModel<Lecture, LectureDocument> {
    get dummyData(): any[] {
        return dummy_lectures;
    }
    constructor(
        @InjectModel(Lecture.name)
        protected lectureModel: Model<LectureDocument>,
        private filesService: FilesService,
    ) {
        super('lectures', lectureModel);
    }

    async updateVideo(id: string, data: UpdateFileDto): Promise<FileDocument> {
        const item = await this.lectureModel.findById(id).populate('video');
        const processedData = await FileUploadHelper.processingVideo(data);
        const file = await this.filesService.create(processedData);
        item.video = file._id;
        await item.save();
        return file;
    }

    async addResource(id: string, data: CreateFileDto): Promise<FileDocument> {
        const item = await this.lectureModel.findById(id);
        const mediaType = FileUploadHelper.getMediaType(data.type);
        if (mediaType) {
            let file: FileDocument;
            switch (mediaType) {
                case 'video':
                    const processedData =
                        await FileUploadHelper.processingVideo(data);
                    file = await this.filesService.create(processedData);
                    break;
                case 'image':
                    file = await this.filesService.create(data);
                    break;
            }
            if (file) {
                (item.resources as File[]).push(file);
                await item.save();
                return file;
            }
        }
    }
    async addResourceId(id: string, resourceId: string): Promise<void> {
        const item = await this.lectureModel.findById(id);
        (item.resources as string[]).push(resourceId);
        await item.save();
    }
    async removeResource(id: string, resourceId: string): Promise<void> {
        const item = await this.lectureModel.findById(id);
        (item.resources as string[]) = (item.resources as string[]).filter(
            (item) => item != resourceId,
        );
        await item.save();
    }
}
