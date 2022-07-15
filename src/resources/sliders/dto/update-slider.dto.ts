import { PartialType } from '@nestjs/swagger';
import { CreateSliderDto } from './create-slider.dto';
export class UpdateSliderDto extends PartialType(CreateSliderDto) {}
