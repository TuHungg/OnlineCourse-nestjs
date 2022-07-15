import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from 'src/resources/users/schemas/user.schema';

export type ActivityLogDocument = ActivityLog & mongoose.Document;

@Schema({ _id: false })
class Client {
    @Prop()
    type: string;
    @Prop()
    name: string;
    @Prop()
    version: string;
    @Prop()
    engine: string;
    @Prop()
    engineVersion: string;
}

@Schema({ _id: false })
class Os {
    @Prop()
    name: string;
    @Prop()
    version: string;
    @Prop()
    platform: string;
}

@Schema({ _id: false })
class Device {
    @Prop()
    type: string;
    @Prop()
    brand: string;
    @Prop()
    model: string;
}

//
@Schema({ _id: false })
export class Geolocation {
    @Prop({ required: true })
    lat: number;
    @Prop({ required: true })
    long: number;
}
@Schema({ _id: false })
export class GeolocationInfo {
    @Prop()
    geolocation?: Geolocation;
    @Prop()
    message?: string;
}

@Schema({ _id: false })
export class DeviceInfo {
    @Prop({ required: true })
    ip: string;
    @Prop({ required: true })
    geolocationInfo: GeolocationInfo;
    //
    @Prop()
    client: Client;
    @Prop()
    os: Os;
    @Prop()
    device: Device;
    @Prop()
    bot: string | null;
}

@Schema()
export class ActivityLog {
    _id: mongoose.Schema.Types.ObjectId;
    @Prop({
        required: false,
        type: mongoose.Schema.Types.ObjectId,
        ref: User.name,
    })
    user?: User;
    @Prop({ required: true })
    deviceInfo: DeviceInfo;
    @Prop({ required: true })
    content: string;
    @Prop({ required: true })
    timestamp: string;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);
