import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AppAbility } from 'src/casl/casl-ability.factory';
import { BaseController } from 'src/common/shared/base-controller';
import { ClientQueryDto } from 'src/common/shared/dtos/client-query.dto';
import { FileQueryDto } from 'src/common/shared/dtos/file-query.dto';
import { IdsDto } from 'src/common/shared/dtos/ids.dto';
import { ACCESS_TOKEN_KEY } from 'src/common/utils/constants/app.constant';
import { CheckPolicies, PoliciesGuard } from 'src/guards/policies.guard';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FilesService } from './files.service';
import { File, FileDocument } from './schemas/file.schema';

@ApiTags('files')
@Controller('files')
export class FilesController extends BaseController<File, FileDocument> {
    constructor(private readonly filesService: FilesService) {
        super(filesService);
    }

    // FETCHES
    @Get('my-files')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('read-own', 'File'))
    fetchFilesByUserId(@Req() req, @Query() query: FileQueryDto) {
        return this.filesService.getUserFilesById(req.user._id, query);
    }

    @Get('count-my-files')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('read-own', 'File'))
    countFilesByUserId(@Req() req, @Query() query: FileQueryDto) {
        return this.filesService.countUserFilesById(req.user._id, query);
    }
    //
    @Get('parse-video/:url')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('read-own', 'File'))
    parseVideo(@Param('url') url: string) {
        return this.filesService.parseVideo(url);
    }
    //
    @Get()
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('read', 'File'))
    protected async fetchAll(@Query() query: ClientQueryDto): Promise<File[]> {
        return super.findAll(query);
    }
    //
    @Get('count')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('read', 'File'))
    @UsePipes(new ValidationPipe({ transform: true }))
    async count(@Query() query: ClientQueryDto): Promise<number> {
        return super.count(query);
    }
    //
    @Get(':id')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('read', 'File'))
    async fetchById(@Param('id') id: string): Promise<File> {
        return super.findById(id);
    }
    // CREATE
    @Post()
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('create', 'File'))
    create(@Body() data: CreateFileDto) {
        return this.filesService.create(data);
    }
    // UPDATE
    @Patch(':id')
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @CheckPolicies((ability: AppAbility) => ability.can('update', 'File'))
    update(@Param('id') id: string, @Body() data: UpdateFileDto) {
        return this.filesService.updateById(id, data);
    }
    // DELETE
    @Delete('records')
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @CheckPolicies((ability: AppAbility) => ability.can('delete', 'File'))
    async deleteRecords(@Query() ids: IdsDto): Promise<File[]> {
        return super.deleteMany(ids);
    }
    //
    @Delete(':id')
    @UseGuards(JwtAuthGuard, PoliciesGuard)
    @ApiBearerAuth(ACCESS_TOKEN_KEY)
    @CheckPolicies((ability: AppAbility) => ability.can('delete', 'File'))
    async deleteRecord(@Param('id') id: string): Promise<File> {
        return super.deleteOne(id);
    }
}
