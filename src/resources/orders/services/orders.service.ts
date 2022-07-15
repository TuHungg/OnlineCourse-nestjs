import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import dummy_orders from 'src/common/dummy_data/dummy_orders';
import { BaseModel, IEmbedOption } from 'src/common/shared/base-model';
import { Order, OrderDocument } from '../schemas/order.schema';

@Injectable()
export class OrdersService extends BaseModel<Order, OrderDocument> {
    get dummyData(): any[] {
        return dummy_orders;
    }

    protected searchFields: string[] = [
        '_id',
        'history.createdBy.email',
        'history.createdBy.profile.fullName',
    ];

    protected basicEmbedOptions: IEmbedOption[] = [
        {
            path: 'history.createdBy',
            collection: 'users',
        },
    ];

    protected displayFields: string[] = [
        '_id',
        'totalPrice',
        'coursesInOrder',
        'moneyConfiguration',
        'history',
    ];

    constructor(@InjectModel(Order.name) protected orderModel: Model<OrderDocument>) {
        super('orders', orderModel);
    }
    async getOrderDetail(id: string) {
        const result = await this.model.findById(id).populate([
            {
                path: 'history.createdBy',
            },
            {
                path: 'coursesInOrder.course',
            },
        ]);
        return result;
    }
}
