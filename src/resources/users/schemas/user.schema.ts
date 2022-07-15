import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Course } from 'src/resources/courses/schemas/course.schema';
import { Role } from 'src/resources/roles/schemas/role.schema';
import { CourseDocument } from './../../courses/schemas/course.schema';

const { Types } = mongoose.Schema;
export type UserDocument = User & mongoose.Document;

@Schema({ _id: false })
export class Profile {
    @Prop()
    avatar?: string;
    @Prop()
    firstName?: string;
    @Prop()
    lastName?: string;
    @Prop()
    fullName?: string;
    @Prop()
    phone?: string;
    @Prop()
    address?: string;
}

@Schema({ _id: false })
export class MyCourses {
    @Prop({ type: [{ type: Types.ObjectId, ref: 'Course' }] })
    wishlist?: Course[];
    @Prop()
    lists?: CourseList[];
}

@Schema({ _id: false })
class CourseList {
    @Prop()
    name?: string;
    @Prop({ type: [{ type: Types.ObjectId, ref: 'Course' }] })
    Course?: Course[];
}

@Schema({ _id: false })
export class Cart {
    @Prop({
        required: true,
        default: [],
        type: [{ type: Types.ObjectId, ref: 'Course' }],
    })
    courses: CourseDocument[];
}

export type UserProviders = 'password' | 'google';
export type TUserStatus = 'active' | 'inactive' | 'block' | 'unverified';
@Schema()
export class User {
    _id: mongoose.Schema.Types.ObjectId;
    @Prop({ required: true, unique: true, index: true })
    email: string;
    @Prop()
    password?: string;
    @Prop({ required: true, default: 'inactive' as TUserStatus })
    status: TUserStatus;
    @Prop({
        require: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: Role.name,
    })
    role: Role;
    @Prop({ requried: true, default: {} })
    profile: Profile;
    @Prop({ require: true, default: ['password'] })
    providers?: UserProviders[];
    @Prop()
    refreshToken?: string;
    @Prop({ required: true, default: {} })
    myCourses: MyCourses;
    @Prop({ required: true, default: {} })
    cart: Cart;
    @Prop({ required: true })
    createdAt: string;
    @Prop()
    lastLoggon?: string;
    @Prop()
    updatedAt?: string;
    @Prop()
    permissionCode?: string;
    @Prop()
    permissionCodeTimestamp?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
