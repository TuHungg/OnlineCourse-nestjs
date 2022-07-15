import { HistoryProp } from 'src/common/shared/dtos/shared.dto';
import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsDefined, IsMongoId, IsNumber, ValidateNested } from "class-validator"
import { IsCourseDiscount, IsCoursePrice } from "src/resources/courses/dto/course.vld"
import { IsOrderPrice } from "./order.vld"

class CourseInOrder {
    @ApiProperty()
    @IsDefined()
    @IsMongoId()
    course: string

    @ApiProperty()
    @IsCourseDiscount({ required: true })
    discount: number

    @ApiProperty()
    @IsCoursePrice({ required: true })
    price: number
}
export class CreateOrderDto {
    @ApiProperty()
    @IsOrderPrice({ required: true })
    totalPrice: number

    @ApiProperty()
    @IsCourseDiscount({ required: true })
    discount: number

    @ApiProperty({
        isArray: true,
        type: CourseInOrder
    })
    @IsDefined()
    @ValidateNested({ each: true })
    @Type(() => CourseInOrder)
    coursesInOrder: CourseInOrder[]

    @ApiProperty()
    @IsDefined()
    @ValidateNested()
    @Type(() => HistoryProp)
    history: HistoryProp
}
