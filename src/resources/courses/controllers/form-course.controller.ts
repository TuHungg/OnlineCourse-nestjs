import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ACCESS_TOKEN_KEY } from 'src/common/utils/constants/app.constant';
import { UpdateFileDto } from '../../files/dto/update-file.dto';
import { AddCourseSectionDto } from '../dto/add-course-section.dto';
import { AddCourseUnitDto } from '../dto/add-course-unit.dto';
import { DeleteCourseSectionDto } from '../dto/delete-course-section.dto';
import { DeleteCourseUnitDto } from '../dto/delete-course-unit.dto';
import { MoveCourseUnitToSectionDto } from '../dto/move-course-unit-to-setction.dto';
import { SwapCourseSectionDto } from '../dto/swap-course-section.dto';
import { SwapCourseUnitDto } from '../dto/swap-course-unit.dto';
import { UpdateCourseSectionDto } from '../dto/update-course-section.dto';
import FormCourseService from '../services/form-course.service';

@ApiTags('course apis for curriculum editing')
@Controller('courses/curriculum')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth(ACCESS_TOKEN_KEY)
export class CourseFormController {
    constructor(private readonly formCourseService: FormCourseService) {}

    @Patch('swap-section/:id')
    swapSection(@Param('id') id: string, @Body() data: SwapCourseSectionDto) {
        return this.formCourseService.swapSection(id, data);
    }

    @Patch('swap-unit/:id')
    swapUnit(@Param('id') id: string, @Body() data: SwapCourseUnitDto) {
        return this.formCourseService.swapUnit(id, data);
    }

    @Patch('add-section/:id')
    addSection(@Param('id') id: string, @Body() data: AddCourseSectionDto) {
        return this.formCourseService.addSection(id, data);
    }
    @Patch('add-unit/:id')
    addUnit(@Param('id') id: string, @Body() data: AddCourseUnitDto) {
        return this.formCourseService.addUnit(id, data);
    }
    @Patch('update-section/:id')
    updateSection(@Param('id') id: string, @Body() data: UpdateCourseSectionDto) {
        return this.formCourseService.updateSection(id, data);
    }

    @Patch('delete-section/:id')
    deleteSection(@Param('id') id: string, @Body() data: DeleteCourseSectionDto) {
        return this.formCourseService.deleteSection(id, data);
    }
    @Patch('delete-unit/:id')
    deleteUnit(@Param('id') id: string, @Body() data: DeleteCourseUnitDto) {
        return this.formCourseService.deleteUnit(id, data);
    }
    @Patch('move-unit-to-section/:id')
    moveUnitToSection(@Param('id') id: string, @Body() data: MoveCourseUnitToSectionDto) {
        return this.formCourseService.moveUnitToSection(id, data);
    }

    @Patch('update-lecture-video/:id')
    addVideo(@Param('id') id: string, @Body() data: UpdateFileDto) {
        return this.formCourseService.updateLectureVideo(id, data);
    }

    @Patch('update-lecture-video-from-library/:id/:fileId')
    updateLectureVideoFromLibrary(@Param('id') id: string, @Param('fileId') fileId: string) {
        return this.formCourseService.updateLectureVideoFromLibrary(id, fileId);
    }
}
