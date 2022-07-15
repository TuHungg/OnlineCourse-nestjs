import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Helper from 'src/common/utils/helpers/helper.helper';
import { CoursesService } from 'src/resources/courses/services/courses.service';
import { UpdateFileDto } from 'src/resources/files/dto/update-file.dto';
import { FilesService } from 'src/resources/files/files.service';
import { FileDocument } from 'src/resources/files/schemas/file.schema';
import { LecturesService } from 'src/resources/lectures/lectures.service';
import { QuizzesService } from 'src/resources/quizzes/quizzes.service';
import { UserCourseService } from 'src/resources/user-course/user-course.service';
import { AddCourseSectionDto } from '../dto/add-course-section.dto';
import { AddCourseUnitDto } from '../dto/add-course-unit.dto';
import { ApproveCourseDto } from '../dto/approve-course.dto';
import { DeleteCourseSectionDto } from '../dto/delete-course-section.dto';
import { DeleteCourseUnitDto } from '../dto/delete-course-unit.dto';
import { MoveCourseUnitToSectionDto } from '../dto/move-course-unit-to-setction.dto';
import { SwapCourseSectionDto } from '../dto/swap-course-section.dto';
import { SwapCourseUnitDto } from '../dto/swap-course-unit.dto';
import { UpdateCourseSectionDto } from '../dto/update-course-section.dto';
import { Course, CourseDocument, SectionDocument, UnitDocument } from '../schemas/course.schema';
@Injectable()
export default class FormCourseService extends CoursesService {
    constructor(
        @InjectModel(Course.name) protected courseModel: Model<CourseDocument>,
        protected quizzesService: QuizzesService,
        protected filesService: FilesService,
        protected readonly lecturesService: LecturesService,
        protected readonly userCourseService: UserCourseService
    ) {
        super(courseModel);
    }

    // COURSE FORM
    async swapSection(id: string, data: SwapCourseSectionDto): Promise<CourseDocument> {
        const item = await this.courseModel.findById(id);
        const aIdx = item.details.sections.findIndex((item) => item._id == data.aId);
        const bIdx = item.details.sections.findIndex((item) => item._id == data.bId);
        if (aIdx > -1 && bIdx > -1 && aIdx != bIdx) {
            [item.details.sections[aIdx], item.details.sections[bIdx]] = [
                item.details.sections[bIdx],
                item.details.sections[aIdx],
            ];
        }
        await item.save();
        return item;
    }

    async swapUnit(id: string, data: SwapCourseUnitDto): Promise<CourseDocument> {
        const item = await this.courseModel.findById(id);
        const parentAIdx = this.findSectionIdxById(item, data.parentAId);
        const parentBIdx = this.findSectionIdxById(item, data.parentBId);
        if (parentAIdx > -1 && parentBIdx > -1) {
            const aIdx = this.findUnitIdxById(item, parentAIdx, data.aId);
            const bIdx = this.findUnitIdxById(item, parentBIdx, data.bId);
            if (aIdx > -1 && bIdx > -1 && (aIdx != bIdx || parentAIdx != parentBIdx)) {
                [
                    item.details.sections[parentAIdx].units[aIdx],
                    item.details.sections[parentBIdx].units[bIdx],
                ] = [
                    item.details.sections[parentBIdx].units[bIdx],
                    item.details.sections[parentAIdx].units[aIdx],
                ];
                await item.save();
                return item;
            }
        }
    }

    async addSection(id: string, data: AddCourseSectionDto): Promise<SectionDocument> {
        const item = await this.courseModel.findById(id);
        item.details.sections.splice(data.sectionIndex, 0, data.data as any);
        await item.save();
        return item.details.sections[data.sectionIndex];
    }

    async addUnit(id: string, data: AddCourseUnitDto): Promise<UnitDocument> {
        switch (data.unit.type) {
            case 'lecture':
                return this.addLectureUnit(id, data);
            case 'quiz':
                return this.addQuizUnit(id, data);
        }
    }

    async addQuizUnit(id: string, data: AddCourseUnitDto): Promise<UnitDocument> {
        const item = await this.courseModel.findById(id);
        const sectionIdx = this.findSectionIdxById(item, data.sectionId);
        if (sectionIdx > -1) {
            const content = await this.quizzesService.create(data.unit.quiz);
            const unitData: any = {
                ...data.unit,
                quiz: content._id,
            };
            item.details.sections[sectionIdx].units.splice(data.unitIndex, 0, unitData);
            await item.save();
            const unitResult = item.details.sections[sectionIdx].units[data.unitIndex];
            unitResult.quiz = content;
            return unitResult;
        }
    }

    async addLectureUnit(id: string, data: AddCourseUnitDto): Promise<UnitDocument> {
        const item = await this.courseModel.findById(id);
        const sectionIdx = this.findSectionIdxById(item, data.sectionId);
        if (sectionIdx > -1) {
            const content = await this.lecturesService.create(data.unit.lecture);
            const unitData: any = {
                ...data.unit,
                lecture: content._id,
            };
            item.details.sections[sectionIdx].units.splice(data.unitIndex, 0, unitData);
            await item.save();
            const unitResult = item.details.sections[sectionIdx].units[data.unitIndex];
            unitResult.lecture = content;
            return unitResult;
        }
    }

    async updateSection(id: string, data: UpdateCourseSectionDto): Promise<CourseDocument> {
        const item = await this.courseModel.findById(id);
        const section = item.details.sections.find((item) => item._id == data.sectionId);
        if (section) {
            section.title = data.data.title;
            section.objective = data.data.objective;
            await item.save();
            return item;
        }
    }

    async deleteSection(id: string, data: DeleteCourseSectionDto): Promise<CourseDocument> {
        const item = await this.courseModel.findById(id);
        const section = item.details.sections.find((section) => section._id == data.sectionId);
        if (section) {
            for (const item of section.units) {
                await this.deleteUnitRefDoc(item);
            }
            item.details.sections = item.details.sections.filter(
                (item) => item._id != data.sectionId
            );
            await item.save();
            return item;
        }
    }

    async deleteUnit(id: string, data: DeleteCourseUnitDto): Promise<CourseDocument> {
        const item = await this.courseModel.findById(id);
        const section = item.details.sections[data.sectionIndex];
        if (section) {
            const unit = section.units.find((item) => item._id == data.unitId);
            if (unit) {
                await this.deleteUnitRefDoc(unit);
                item.details.sections[data.sectionIndex].units = item.details.sections[
                    data.sectionIndex
                ].units.filter((unit) => unit._id != data.unitId);
                await item.save();
                return item;
            }
        }
    }

    async moveUnitToSection(id: string, data: MoveCourseUnitToSectionDto): Promise<CourseDocument> {
        const item = await this.courseModel.findById(id);
        const toSectionIdx = this.findSectionIdxById(item, data.sectionId);
        const fromSectionIdx = this.findSectionIdxById(item, data.unitAddress.sectionId);
        const fromUnitIdx = this.findUnitIdxById(item, fromSectionIdx, data.unitAddress.id);
        if (toSectionIdx > -1 && fromSectionIdx > -1 && fromUnitIdx > -1) {
            const [fromUnit] = item.details.sections[fromSectionIdx].units.splice(fromUnitIdx, 1);
            if (fromUnit) {
                if (fromSectionIdx < toSectionIdx) {
                    item.details.sections[toSectionIdx].units.splice(0, 0, fromUnit);
                } else {
                    const unitLength = item.details.sections[toSectionIdx].units.length;
                    item.details.sections[toSectionIdx].units.splice(unitLength, 0, fromUnit);
                }
                await item.save();
                return item;
            }
        }
    }

    //HELPER
    private findSectionIdxById(item: Course, id: string) {
        return item.details.sections.findIndex((item) => item._id == id);
    }

    private findUnitIdxById(item: Course, sectionIdx: number, id: string) {
        if (sectionIdx > -1) {
            return item.details.sections[sectionIdx].units.findIndex((item) => item._id == id);
        }
        return -1;
    }

    async deleteUnitRefDoc(unit: UnitDocument) {
        switch (unit.type) {
            case 'lecture':
                const lecture = await this.lecturesService.model
                    .findById(unit.lecture)
                    .populate('video');
                if (!!lecture.video?.duration) {
                    await this.updateContentVideoLength(unit.lecture + '', -lecture.video.duration);
                }
                await this.lecturesService.deleteById(unit.lecture as unknown as string);
                break;
            case 'quiz':
                await this.quizzesService.deleteById(unit.quiz as unknown as string);
                break;
        }
    }

    async updateLectureVideo(lectureId: string, data: UpdateFileDto) {
        const lecture = await this.lecturesService.model
            .findById(lectureId)
            .populate({ path: 'video' });
        const file = await this.lecturesService.updateVideo(lectureId, data);
        let diffDuration = file.duration;
        if (!!lecture.video?.duration) {
            //has lecture
            diffDuration -= lecture.video.duration;
        }
        await this.updateContentVideoLength(lectureId, diffDuration);
        return file;
    }
    async updateLectureVideoFromLibrary(lectureId: string, fileId: string): Promise<FileDocument> {
        const lecture = await this.lecturesService.model
            .findById(lectureId)
            .populate({ path: 'video' });
        const file = await this.filesService.findById(fileId);
        let diffDuration = file.duration;
        if (!!lecture.video?.duration) {
            //has lecture
            diffDuration -= lecture.video.duration;
        }
        await this.updateContentVideoLength(lectureId, diffDuration);
        lecture.update({ $set: { video: fileId } }).exec();
        return file;
    }

    async updateContentVideoLength(lectureId: string, diffDuration: number) {
        await this.model.updateOne(
            {
                'details.sections.units.lecture': lectureId,
            },
            {
                $inc: {
                    'meta.contentVideoLength': diffDuration,
                },
            }
        );
    }

    async approve(userId: string, courseId: string, data: ApproveCourseDto) {
        let updateData = {
            status: data.status,
            history: {
                updatedBy: userId,
            },
        };
        updateData = this.attachHistoryData(updateData, 'update');
        return this.model.updateOne(
            {
                _id: courseId,
                status: 'pending',
            },
            {
                $set: Helper.cvtDotObj(updateData),
            }
        );
    }

    convertCourseToDraft(userId: string, courseId: string) {
        let updateData = {
            status: 'draft',
            history: {
                updatedBy: userId,
            },
        };
        updateData = this.attachHistoryData(updateData, 'update');
        return this.model.updateOne(
            {
                _id: courseId,
                status: {
                    $ne: 'active',
                },
            },
            {
                $set: Helper.cvtDotObj(updateData),
            }
        );
    }
}
