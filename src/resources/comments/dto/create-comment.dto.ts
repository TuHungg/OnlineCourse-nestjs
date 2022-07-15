import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsMongoId, ValidateIf, ValidateNested } from 'class-validator';
import { HistoryTimestampProp } from '../../../common/shared/dtos/shared.dto';
import { IsCommentContent } from './comment.vld';
// import { ReactionProp } from 'src/common/shared/dtos/shared.dto';

export class CreateCommentDto {
    @ApiProperty({ required: false })
    @IsMongoId()
    @ValidateIf((object, value) => value !== null)
    parent: string | null;

    @ApiProperty()
    @IsCommentContent({ required: true })
    content: string;

    // @ApiProperty({ required: false })
    // @Type(() => ReactionProp)
    // @ValidateNested()
    // reaction?: ReactionProp

    @ApiProperty({ required: false })
    @Type(() => HistoryTimestampProp)
    @ValidateNested()
    timestamps?: HistoryTimestampProp;
}
