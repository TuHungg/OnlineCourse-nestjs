import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from 'src/common/shared/base-controller';
import { CreateFileDto } from '../files/dto/create-file.dto';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { UpdateLectureDto } from './dto/update-lecture.dto';
import { LecturesService } from './lectures.service';
import { Lecture, LectureDocument } from './schemas/lecture.schema';

@ApiTags('lectures')
@Controller('lectures')
export class LecturesController extends BaseController<
    Lecture,
    LectureDocument
> {
    constructor(private readonly lecturesService: LecturesService) {
        super(lecturesService);
    }

    @Post()
    create(@Body() createLectureDto: CreateLectureDto) {
        return this.lecturesService.create(createLectureDto);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateLectureDto: UpdateLectureDto,
    ) {
        return this.lecturesService.updateById(id, updateLectureDto);
    }

    @Patch('add-resource/:id')
    addResource(@Param('id') id: string, @Body() data: CreateFileDto) {
        return this.lecturesService.addResource(id, data);
    }
    @Patch('add-resource-id/:id/:resourceId')
    addResourceId(@Param('id') id: string, @Param('resourceId') resourceId) {
        return this.lecturesService.addResourceId(id, resourceId);
    }
    @Patch('remove-resource/:id/:resourceId')
    removeResourceId(@Param('id') id: string, @Param('resourceId') resourceId) {
        return this.lecturesService.removeResource(id, resourceId);
    }
}
